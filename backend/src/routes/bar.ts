import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { applyRegenAndGet } from "../game/regen.js";
import { toPlayerMe } from "../game/serialize.js";
import type { BarItemDto, BarSummary, BarUseResult } from "@mafioo/shared";

export const barRouter = Router();

barRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const bars = await prisma.bar.findMany({ include: { owner: true } });
    const dtos: BarSummary[] = bars.map((b) => ({
      id: b.id,
      name: b.name,
      type: b.type,
      rating: b.rating,
      ownerUsername: b.owner?.username ?? null,
    }));
    res.json({ bars: dtos });
  }),
);

function toBarItemDto(item: {
  id: string;
  quantityAvailable: number;
  maxQuantity: number;
  nextAvailableAt: Date | null;
  itemType: { id: string; name: string; category: string; icon: string | null; buyCash: number; requiredLevel: number };
}): BarItemDto {
  return {
    id: item.id,
    itemTypeId: item.itemType.id,
    name: item.itemType.name,
    category: item.itemType.category as BarItemDto["category"],
    icon: item.itemType.icon,
    buyCash: item.itemType.buyCash,
    requiredLevel: item.itemType.requiredLevel,
    quantityAvailable: item.quantityAvailable,
    maxQuantity: item.maxQuantity,
    nextAvailableAt: item.nextAvailableAt ? item.nextAvailableAt.toISOString() : null,
  };
}

barRouter.get(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const bar = await prisma.bar.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { itemType: true } }, owner: true },
    });
    if (!bar) throw new HttpError(404, "Bar not found");

    res.json({
      bar: { id: bar.id, name: bar.name, type: bar.type, rating: bar.rating, ownerUsername: bar.owner?.username ?? null },
      items: bar.items.map(toBarItemDto),
    });
  }),
);

const REPLENISH_MS = 8 * 60 * 60 * 1000; // items refresh 8h after depletion

barRouter.post(
  "/:id/use/:barItemId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const barItem = await prisma.barItem.findUnique({
      where: { id: req.params.barItemId },
      include: { itemType: true },
    });
    if (!barItem || barItem.barId !== req.params.id) throw new HttpError(404, "Item not found");

    const now = new Date();
    let available = barItem.quantityAvailable;
    if (available <= 0) {
      if (barItem.nextAvailableAt && barItem.nextAvailableAt <= now) {
        available = barItem.maxQuantity;
      } else {
        throw new HttpError(400, "Not available right now — check back later");
      }
    }

    const player = await applyRegenAndGet(req.playerId!);
    if (player.level < barItem.itemType.requiredLevel) {
      throw new HttpError(400, `Requires level ${barItem.itemType.requiredLevel}`);
    }
    if (player.cash < barItem.itemType.buyCash) throw new HttpError(400, "Not enough cash");

    const effect = barItem.itemType.effect as Record<string, number>;
    const staminaDelta = effect.stamina ?? 0;
    const toxicationDelta = effect.toxication ?? 0;
    const sexapealDelta = effect.sexapeal ?? 0;

    const nextAvailable = available - 1;
    const updatedPlayer = await prisma.$transaction(async (tx) => {
      await tx.barItem.update({
        where: { id: barItem.id },
        data: {
          quantityAvailable: nextAvailable,
          nextAvailableAt: nextAvailable <= 0 ? new Date(now.getTime() + REPLENISH_MS) : barItem.nextAvailableAt,
        },
      });
      return tx.player.update({
        where: { id: player.id },
        data: {
          cash: player.cash - barItem.itemType.buyCash,
          stamina: Math.min(player.maxStamina, player.stamina + staminaDelta),
          toxication: player.toxication + toxicationDelta,
          sexapeal: player.sexapeal + sexapealDelta,
        },
      });
    });

    const result: BarUseResult = {
      message: `${barItem.itemType.name} used.`,
      player: toPlayerMe(updatedPlayer),
    };
    res.json(result);
  }),
);

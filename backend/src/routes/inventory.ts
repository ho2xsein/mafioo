import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { toPlayerMe } from "../game/serialize.js";
import type { InventoryItemDto } from "@mafioo/shared";

export const inventoryRouter = Router();

inventoryRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await prisma.inventoryItem.findMany({
      where: { playerId: req.playerId! },
      include: { itemType: true },
    });

    const dtos: InventoryItemDto[] = items.map((i) => ({
      id: i.id,
      itemTypeId: i.itemType.id,
      name: i.itemType.name,
      category: i.itemType.category,
      icon: i.itemType.icon,
      quantity: i.quantity,
      equippedSlot: i.equippedSlot,
      sellCash: i.itemType.sellCash,
    }));

    res.json({ items: dtos });
  }),
);

inventoryRouter.post(
  "/:id/sell",
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await prisma.inventoryItem.findUnique({
      where: { id: req.params.id },
      include: { itemType: true },
    });
    if (!item || item.playerId !== req.playerId) throw new HttpError(404, "Item not found");

    const player = await prisma.player.findUniqueOrThrow({ where: { id: req.playerId! } });

    const updatedPlayer = await prisma.$transaction(async (tx) => {
      if (item.quantity <= 1) {
        await tx.inventoryItem.delete({ where: { id: item.id } });
      } else {
        await tx.inventoryItem.update({ where: { id: item.id }, data: { quantity: item.quantity - 1 } });
      }
      return tx.player.update({
        where: { id: player.id },
        data: { cash: player.cash + item.itemType.sellCash },
      });
    });

    res.json({ player: toPlayerMe(updatedPlayer) });
  }),
);

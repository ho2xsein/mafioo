import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { toPlayerMe } from "../game/serialize.js";
import type { ExtraDto } from "@mafioo/shared";

export const extrasRouter = Router();

extrasRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [extras, active] = await Promise.all([
      prisma.extra.findMany({ orderBy: { priceCredits: "asc" } }),
      prisma.playerActiveExtra.findMany({
        where: { playerId: req.playerId!, expiresAt: { gt: new Date() } },
      }),
    ]);
    const activeByExtraId = new Map(active.map((a) => [a.extraId, a.expiresAt]));

    const dtos: ExtraDto[] = extras.map((e) => ({
      id: e.id,
      extraId: e.extraId,
      name: e.name,
      description: e.description,
      kind: e.kind,
      priceCredits: e.priceCredits,
      durationHours: e.durationHours,
      activeUntil: activeByExtraId.get(e.id)?.toISOString() ?? null,
    }));

    res.json({ extras: dtos });
  }),
);

extrasRouter.post(
  "/buy/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const extra = await prisma.extra.findUnique({ where: { id: req.params.id } });
    if (!extra) throw new HttpError(404, "Unknown extra");

    const player = await prisma.player.findUniqueOrThrow({ where: { id: req.playerId! } });
    if (player.credits < extra.priceCredits) throw new HttpError(400, "Not enough credits");

    const data: Record<string, unknown> = { credits: player.credits - extra.priceCredits };

    switch (extra.kind) {
      case "vip": {
        const base = player.vipExpiresAt && player.vipExpiresAt > new Date() ? player.vipExpiresAt : new Date();
        data.vipExpiresAt = new Date(base.getTime() + extra.durationHours * 60 * 60 * 1000);
        break;
      }
      case "refill_school":
        if (player.schoolPoints > 0) throw new HttpError(400, "School points aren't empty yet");
        data.schoolPoints = player.maxSchoolPoints;
        break;
      case "refill_fitness":
        if (player.fitnessPoints > 0) throw new HttpError(400, "Fitness points aren't empty yet");
        data.fitnessPoints = player.maxFitnessPoints;
        break;
      case "refill_hooker":
        if (player.hookerPoints > 0) throw new HttpError(400, "Hooker points aren't empty yet");
        data.hookerPoints = player.maxHookerPoints;
        break;
      case "refill_stamina":
        data.stamina = player.maxStamina;
        break;
      default:
        // Timed boosts (battle fury, agent attacks, mentor/trainer caps, etc.) are tracked as an
        // active-extra record; applying their effect inside every affected subsystem is future work.
        break;
    }

    const updatedPlayer = await prisma.$transaction(async (tx) => {
      if (extra.durationHours > 0) {
        await tx.playerActiveExtra.create({
          data: {
            playerId: player.id,
            extraId: extra.id,
            expiresAt: new Date(Date.now() + extra.durationHours * 60 * 60 * 1000),
          },
        });
      }
      return tx.player.update({ where: { id: player.id }, data });
    });

    res.json({ player: toPlayerMe(updatedPlayer) });
  }),
);

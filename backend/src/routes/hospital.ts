import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { applyRegenAndGet } from "../game/regen.js";
import { toPlayerMe } from "../game/serialize.js";

export const hospitalRouter = Router();

const bodySchema = z.object({ useCredits: z.boolean().default(false) });

hospitalRouter.post(
  "/detox",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { useCredits } = bodySchema.parse(req.body);
    const player = await applyRegenAndGet(req.playerId!);

    if (useCredits) {
      if (player.credits < 1) throw new HttpError(400, "Not enough credits");
    } else if (player.stamina < 10) {
      throw new HttpError(400, "Not enough stamina");
    }

    const updated = await prisma.player.update({
      where: { id: player.id },
      data: {
        toxication: 0,
        credits: useCredits ? player.credits - 1 : player.credits,
        stamina: useCredits ? player.stamina : player.stamina - 10,
      },
    });
    res.json({ player: toPlayerMe(updated) });
  }),
);

hospitalRouter.post(
  "/heal",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { useCredits } = bodySchema.parse(req.body);
    const player = await applyRegenAndGet(req.playerId!);

    if (useCredits) {
      if (player.credits < 1) throw new HttpError(400, "Not enough credits");
    } else if (player.stamina < 2) {
      throw new HttpError(400, "Not enough stamina");
    }

    const updated = await prisma.player.update({
      where: { id: player.id },
      data: {
        life: player.maxLife,
        credits: useCredits ? player.credits - 1 : player.credits,
        stamina: useCredits ? player.stamina : player.stamina - 2,
      },
    });
    res.json({ player: toPlayerMe(updated) });
  }),
);

const SURGERY_CASH = 31_800;
const SURGERY_STAMINA = 60;

hospitalRouter.post(
  "/surgery",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { useCredits } = bodySchema.parse(req.body);
    const player = await applyRegenAndGet(req.playerId!);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (player.lastSurgeryAt && player.lastSurgeryAt >= today) {
      throw new HttpError(400, "Plastic surgery is limited to once per day");
    }

    if (useCredits) {
      if (player.credits < 1) throw new HttpError(400, "Not enough credits");
    } else {
      if (player.cash < SURGERY_CASH) throw new HttpError(400, "Not enough cash");
      if (player.stamina < SURGERY_STAMINA) throw new HttpError(400, "Not enough stamina");
    }

    const updated = await prisma.player.update({
      where: { id: player.id },
      data: {
        heat: 0,
        criminalRecord: 0,
        lastSurgeryAt: new Date(),
        credits: useCredits ? player.credits - 1 : player.credits,
        cash: useCredits ? player.cash : player.cash - SURGERY_CASH,
        stamina: useCredits ? player.stamina : player.stamina - SURGERY_STAMINA,
      },
    });
    res.json({ player: toPlayerMe(updated) });
  }),
);

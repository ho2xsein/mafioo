import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { toPlayerMe, toPlayerPublic } from "../game/serialize.js";
import { AVATAR_IDS } from "@mafioo/shared";

export const profileRouter = Router();

const avatarSchema = z.object({ avatarId: z.number().int().refine((id) => AVATAR_IDS.includes(id), "Unknown avatar") });

profileRouter.post(
  "/me/avatar",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { avatarId } = avatarSchema.parse(req.body);
    const player = await prisma.player.update({ where: { id: req.playerId! }, data: { avatarId } });
    res.json({ player: toPlayerMe(player) });
  }),
);

profileRouter.get(
  "/:username",
  requireAuth,
  asyncHandler(async (req, res) => {
    const player = await prisma.player.findUnique({ where: { username: req.params.username } });
    if (!player) throw new HttpError(404, "Player not found");
    res.json({ player: toPlayerPublic(player) });
  }),
);

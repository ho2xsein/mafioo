import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { toPlayerPublic } from "../game/serialize.js";

export const profileRouter = Router();

profileRouter.get(
  "/:username",
  requireAuth,
  asyncHandler(async (req, res) => {
    const player = await prisma.player.findUnique({ where: { username: req.params.username } });
    if (!player) throw new HttpError(404, "Player not found");
    res.json({ player: toPlayerPublic(player) });
  }),
);

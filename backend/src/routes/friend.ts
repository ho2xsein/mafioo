import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { toPlayerPublic } from "../game/serialize.js";
import type { FriendDto } from "@mafioo/shared";

export const friendRouter = Router();

friendRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const friendships = await prisma.friendship.findMany({
      where: { OR: [{ fromId: req.playerId! }, { toId: req.playerId! }] },
      include: { from: true, to: true },
    });

    const dtos: FriendDto[] = friendships.map((f) => {
      const other = f.fromId === req.playerId ? f.to : f.from;
      return { id: f.id, friend: toPlayerPublic(other), status: f.status };
    });

    res.json({ friends: dtos });
  }),
);

const inviteSchema = z.object({ username: z.string().min(1) });

friendRouter.post(
  "/invite",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { username } = inviteSchema.parse(req.body);
    const target = await prisma.player.findUnique({ where: { username } });
    if (!target) throw new HttpError(404, "Player not found");
    if (target.id === req.playerId) throw new HttpError(400, "Cannot friend yourself");

    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { fromId: req.playerId!, toId: target.id },
          { fromId: target.id, toId: req.playerId! },
        ],
      },
    });
    if (existing) throw new HttpError(409, "Friendship already exists or pending");

    const friendship = await prisma.friendship.create({
      data: { fromId: req.playerId!, toId: target.id, status: "pending" },
    });
    res.status(201).json({ id: friendship.id });
  }),
);

friendRouter.post(
  "/:id/accept",
  requireAuth,
  asyncHandler(async (req, res) => {
    const friendship = await prisma.friendship.findUnique({ where: { id: req.params.id } });
    if (!friendship || friendship.toId !== req.playerId) throw new HttpError(404, "Invite not found");

    const updated = await prisma.friendship.update({
      where: { id: friendship.id },
      data: { status: "accepted" },
    });
    res.json({ id: updated.id, status: updated.status });
  }),
);

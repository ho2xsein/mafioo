import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { toPlayerMe } from "../game/serialize.js";
import { applyRegenAndGet } from "../game/regen.js";
import { COOKIE_NAME, requireAuth } from "../middleware/auth.js";
import { SKILL_KEYS } from "@mafioo/shared";

export const authRouter = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_-]+$/, "letters, numbers, - and _ only"),
  email: z.string().email(),
  password: z.string().min(8).max(72),
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.player.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }] },
    });
    if (existing) {
      throw new HttpError(409, "Username or email already taken", {
        username: existing.username === data.username ? "already taken" : "",
        email: existing.email === data.email ? "already taken" : "",
      });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const player = await prisma.$transaction(async (tx) => {
      const created = await tx.player.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash,
          streetX: Math.floor(Math.random() * 20) - 10,
          streetY: Math.floor(Math.random() * 20) - 10,
        },
      });

      const skills = await tx.skill.findMany({ where: { key: { in: [...SKILL_KEYS] } } });
      if (skills.length > 0) {
        await tx.playerSkill.createMany({
          data: skills.map((skill) => ({ playerId: created.id, skillId: skill.id, level: 0 })),
        });
      }

      return created;
    });

    const token = signToken({ playerId: player.id });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.status(201).json({ player: toPlayerMe(player) });
  }),
);

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const data = loginSchema.parse(req.body);
    const player = await prisma.player.findUnique({ where: { username: data.username } });
    if (!player) throw new HttpError(401, "Invalid username or password");

    const valid = await bcrypt.compare(data.password, player.passwordHash);
    if (!valid) throw new HttpError(401, "Invalid username or password");

    const token = signToken({ playerId: player.id });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({ player: toPlayerMe(player) });
  }),
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.status(204).end();
});

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const player = await applyRegenAndGet(req.playerId!);
    res.json({ player: toPlayerMe(player) });
  }),
);

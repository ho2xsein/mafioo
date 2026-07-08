import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { toPlayerPublic } from "../game/serialize.js";
import type { CrimeLogEntry } from "@mafioo/shared";

export const crimeLogRouter = Router();

crimeLogRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const entries = await prisma.crimeLog.findMany({
      where: { OR: [{ attackerId: req.playerId! }, { victimId: req.playerId! }] },
      include: { attacker: true, victim: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const dtos: CrimeLogEntry[] = entries.map((e) => ({
      id: e.id,
      type: e.type,
      attacker: toPlayerPublic(e.attacker),
      victim: toPlayerPublic(e.victim),
      result: e.result as CrimeLogEntry["result"],
      createdAt: e.createdAt.toISOString(),
    }));

    res.json({ entries: dtos });
  }),
);

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { toPlayerMe } from "../game/serialize.js";
import type { SkillDto, SkillKey } from "@mafioo/shared";

export const skillsRouter = Router();

skillsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [skills, playerSkills] = await Promise.all([
      prisma.skill.findMany(),
      prisma.playerSkill.findMany({ where: { playerId: req.playerId! } }),
    ]);
    const levelBySkillId = new Map(playerSkills.map((ps) => [ps.skillId, ps.level]));

    const dtos: SkillDto[] = skills.map((skill) => ({
      id: skill.id,
      key: skill.key as SkillKey,
      name: skill.name,
      description: skill.description,
      unlockLevel: skill.unlockLevel,
      level: levelBySkillId.get(skill.id) ?? 0,
    }));

    const player = await prisma.player.findUniqueOrThrow({ where: { id: req.playerId! } });
    res.json({ skills: dtos, freeSkillPoints: player.freeSkillPoints });
  }),
);

skillsRouter.post(
  "/add/:skillKey",
  requireAuth,
  asyncHandler(async (req, res) => {
    const skill = await prisma.skill.findUnique({ where: { key: req.params.skillKey } });
    if (!skill) throw new HttpError(404, "Unknown skill");

    const player = await prisma.player.findUniqueOrThrow({ where: { id: req.playerId! } });
    if (player.freeSkillPoints < 1) throw new HttpError(400, "No free skill points");
    if (player.level < skill.unlockLevel) {
      throw new HttpError(400, `Requires player level ${skill.unlockLevel}`);
    }

    const playerSkill = await prisma.playerSkill.upsert({
      where: { playerId_skillId: { playerId: player.id, skillId: skill.id } },
      update: { level: { increment: 1 } },
      create: { playerId: player.id, skillId: skill.id, level: 1 },
    });

    const updatedPlayer = await prisma.player.update({
      where: { id: player.id },
      data: { freeSkillPoints: player.freeSkillPoints - 1 },
    });

    res.json({ player: toPlayerMe(updatedPlayer), level: playerSkill.level });
  }),
);

const RESET_COST_CREDITS = 10;

skillsRouter.post(
  "/reset",
  requireAuth,
  asyncHandler(async (req, res) => {
    const player = await prisma.player.findUniqueOrThrow({ where: { id: req.playerId! } });
    if (player.credits < RESET_COST_CREDITS) throw new HttpError(400, "Not enough credits");

    const playerSkills = await prisma.playerSkill.findMany({ where: { playerId: player.id } });
    const totalPointsSpent = playerSkills.reduce((sum, ps) => sum + ps.level, 0);

    const updatedPlayer = await prisma.$transaction(async (tx) => {
      await tx.playerSkill.updateMany({ where: { playerId: player.id }, data: { level: 0 } });
      return tx.player.update({
        where: { id: player.id },
        data: {
          credits: player.credits - RESET_COST_CREDITS,
          freeSkillPoints: player.freeSkillPoints + totalPointsSpent,
        },
      });
    });

    res.json({ player: toPlayerMe(updatedPlayer) });
  }),
);

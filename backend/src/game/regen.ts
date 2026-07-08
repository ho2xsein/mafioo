import type { Player } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

// Tunable regen rates (points per minute). Kept in one place since the
// original game's exact numbers aren't recoverable from static scrapes.
const REGEN_PER_MINUTE = {
  life: 1,
  stamina: 1,
  fitnessPoints: 1 / 30,
  schoolPoints: 1 / 30,
  hookerPoints: 1 / 30,
  battlePoints: 1 / 10,
};

function clamp(value: number, max: number): number {
  return Math.min(max, Math.max(0, value));
}

/** Computes regenerated stat values for a player row without persisting. */
export function computeRegen(player: Player, now = new Date()) {
  const elapsedMinutes = Math.max(0, (now.getTime() - player.lastRegenAt.getTime()) / 60_000);

  return {
    life: clamp(player.life + elapsedMinutes * REGEN_PER_MINUTE.life, player.maxLife),
    stamina: clamp(player.stamina + elapsedMinutes * REGEN_PER_MINUTE.stamina, player.maxStamina),
    fitnessPoints: clamp(
      player.fitnessPoints + elapsedMinutes * REGEN_PER_MINUTE.fitnessPoints,
      player.maxFitnessPoints,
    ),
    schoolPoints: clamp(
      player.schoolPoints + elapsedMinutes * REGEN_PER_MINUTE.schoolPoints,
      player.maxSchoolPoints,
    ),
    hookerPoints: clamp(
      player.hookerPoints + elapsedMinutes * REGEN_PER_MINUTE.hookerPoints,
      player.maxHookerPoints,
    ),
    battlePoints: clamp(
      player.battlePoints + elapsedMinutes * REGEN_PER_MINUTE.battlePoints,
      player.maxBattlePoints,
    ),
  };
}

/** Loads a player, applies regen, persists the new baseline, and returns the fresh row. */
export async function applyRegenAndGet(playerId: string): Promise<Player> {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  const now = new Date();
  const regen = computeRegen(player, now);

  return prisma.player.update({
    where: { id: playerId },
    data: {
      life: Math.floor(regen.life),
      stamina: Math.floor(regen.stamina),
      fitnessPoints: Math.floor(regen.fitnessPoints),
      schoolPoints: Math.floor(regen.schoolPoints),
      hookerPoints: Math.floor(regen.hookerPoints),
      battlePoints: Math.floor(regen.battlePoints),
      lastRegenAt: now,
    },
  });
}

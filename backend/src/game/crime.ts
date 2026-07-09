import type { MapSpot, Player } from "@prisma/client";
import { HttpError } from "../lib/httpError.js";
import { prisma } from "../lib/prisma.js";
import { applyXp, levelUpReward } from "./xp.js";

export interface CrimeOutcome {
  success: boolean;
  cashDelta: number;
  respectDelta: number;
  xpDelta: number;
  heatDelta: number;
  leveledUpTo: number | null;
  message: string;
  updatedPlayer: Player;
}

/** Resolves a crime/action spot against the acting player: spends cost, rolls risk, applies reward. */
export async function performCrimeAction(player: Player, spot: MapSpot): Promise<CrimeOutcome> {
  if (player.cash < spot.cashCost) {
    throw new HttpError(400, "Not enough cash");
  }
  if (player.stamina < spot.staminaCost) {
    throw new HttpError(400, "Not enough stamina");
  }

  const failed = spot.riskPercent > 0 && Math.random() * 100 < spot.riskPercent;
  const cashDelta = failed ? 0 : spot.reward;
  const respectDelta = !failed && spot.reward > 0 ? Math.ceil(spot.reward / 50) : 0;
  const xpDelta = !failed && spot.reward > 0 ? Math.ceil(spot.reward / 20) : 0;
  const heatDelta = failed ? 5 : spot.reward > 0 ? 2 : 0;

  const { level, xp, levelsGained } = applyXp(player.level, player.xp, xpDelta);

  let strength = player.strength;
  let intellect = player.intellect;
  let sexapeal = player.sexapeal;
  let connections = player.connections;
  let life = player.life;
  let freeSkillPoints = player.freeSkillPoints;
  for (const gainedLevel of levelsGained) {
    const reward = levelUpReward(gainedLevel);
    strength += reward.statGain;
    intellect += reward.statGain;
    sexapeal += reward.statGain;
    connections += reward.connectionsGain;
    freeSkillPoints += 1;
    life = player.maxLife;
  }

  const updatedPlayer = await prisma.player.update({
    where: { id: player.id },
    data: {
      cash: player.cash - spot.cashCost + cashDelta,
      respect: player.respect + respectDelta,
      stamina: player.stamina - spot.staminaCost,
      heat: player.heat + heatDelta,
      level,
      xp,
      strength,
      intellect,
      sexapeal,
      connections,
      life,
      freeSkillPoints,
    },
  });

  return {
    success: !failed,
    cashDelta: cashDelta - spot.cashCost,
    respectDelta,
    xpDelta,
    heatDelta,
    leveledUpTo: levelsGained.length > 0 ? level : null,
    message: failed
      ? `${spot.spotLabel}: ${spot.actionLabel} went wrong — you got spotted.`
      : `${spot.spotLabel}: ${spot.actionLabel} paid off.`,
    updatedPlayer,
  };
}

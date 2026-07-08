import type { MapSpot, Player } from "@prisma/client";
import { HttpError } from "../lib/httpError.js";
import { prisma } from "../lib/prisma.js";
import { applyXp } from "./xp.js";

export interface CrimeOutcome {
  success: boolean;
  cashDelta: number;
  xpDelta: number;
  heatDelta: number;
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

  const failed = Math.random() * 100 < spot.riskPercent;
  const reward = failed
    ? 0
    : Math.floor(spot.rewardMin + Math.random() * Math.max(1, spot.rewardMax - spot.rewardMin));
  const xpDelta = failed ? 0 : Math.max(1, Math.floor(reward / 20));
  const heatDelta = failed ? 5 : 2;

  const { level, xp } = applyXp(player.level, player.xp, xpDelta);

  const updatedPlayer = await prisma.player.update({
    where: { id: player.id },
    data: {
      cash: player.cash - spot.cashCost + reward,
      stamina: player.stamina - spot.staminaCost,
      heat: player.heat + heatDelta,
      level,
      xp,
    },
  });

  return {
    success: !failed,
    cashDelta: reward - spot.cashCost,
    xpDelta,
    heatDelta,
    message: failed ? `${spot.label} went wrong — you got spotted.` : `${spot.label} paid off.`,
    updatedPlayer,
  };
}

import type { Player } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const DAILY_INTEREST_RATE = 0.006; // 0.6%/day, matches the real game's bank help text

/** Compounds bank-balance interest for elapsed days since last accrual and persists the new baseline. */
export async function applyBankInterest(playerId: string): Promise<Player> {
  const player = await prisma.player.findUniqueOrThrow({ where: { id: playerId } });
  const now = new Date();
  const elapsedDays = (now.getTime() - player.lastInterestAt.getTime()) / 86_400_000;
  if (elapsedDays <= 0 || player.bankBalance <= 0) {
    if (elapsedDays <= 0) return player;
    return prisma.player.update({ where: { id: playerId }, data: { lastInterestAt: now } });
  }

  const newBalance = Math.floor(player.bankBalance * Math.pow(1 + DAILY_INTEREST_RATE, elapsedDays));
  return prisma.player.update({
    where: { id: playerId },
    data: { bankBalance: newBalance, lastInterestAt: now },
  });
}

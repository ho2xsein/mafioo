import type { Player } from "@prisma/client";

/**
 * Derived from the real game: Attack = floor((Strength + Intellect + Sexapeal) / 3),
 * verified against three independent in-game tooltip examples.
 */
export function computeAttack(player: Pick<Player, "strength" | "intellect" | "sexapeal">): number {
  const modeBonus = player.strength + player.intellect + player.sexapeal;
  return Math.floor(modeBonus / 3);
}

/** Defense is capped at 30%; attack mode shifts a small amount between attack and defense. */
export function computeDefencePercent(player: Pick<Player, "attackMode">): number {
  if (player.attackMode === "defensive") return 10;
  return 0;
}

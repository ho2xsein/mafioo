/**
 * XP required to reach the next level, given the current level.
 * Calibrated against the real game: a level-5 player needed 400,000 XP to
 * reach level 6, and 3200 * 5^3 = 400,000 exactly.
 */
export function xpForLevel(level: number): number {
  return 3200 * level * level * level;
}

export function xpToNextLevel(level: number, xp: number): number {
  return Math.max(0, xpForLevel(level) - xp);
}

/** Applies an XP delta and returns the resulting level/xp plus every level reached along the way. */
export function applyXp(
  level: number,
  xp: number,
  delta: number,
): { level: number; xp: number; levelsGained: number[] } {
  let newLevel = level;
  let newXp = xp + delta;
  const levelsGained: number[] = [];

  while (newXp >= xpForLevel(newLevel)) {
    newXp -= xpForLevel(newLevel);
    newLevel += 1;
    levelsGained.push(newLevel);
  }

  return { level: newLevel, xp: newXp, levelsGained };
}

/**
 * Real game's observed level-up rewards: +100 * newLevel to each of
 * strength/intellect/sexapeal, +(newLevel + 6) connections, full heal.
 */
export function levelUpReward(newLevel: number) {
  return {
    statGain: newLevel * 100,
    connectionsGain: newLevel + 6,
  };
}

/** XP required to reach the next level, given the current level. Simple quadratic curve. */
export function xpForLevel(level: number): number {
  return 1000 * level * level;
}

export function xpToNextLevel(level: number, xp: number): number {
  return Math.max(0, xpForLevel(level) - xp);
}

/** Applies an XP delta and returns the resulting level/xp, leveling up as many times as earned. */
export function applyXp(level: number, xp: number, delta: number): { level: number; xp: number; leveledUp: boolean } {
  let newLevel = level;
  let newXp = xp + delta;
  let leveledUp = false;

  while (newXp >= xpForLevel(newLevel)) {
    newXp -= xpForLevel(newLevel);
    newLevel += 1;
    leveledUp = true;
  }

  return { level: newLevel, xp: newXp, leveledUp };
}

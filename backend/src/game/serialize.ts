import type { Player } from "@prisma/client";
import type { PlayerMe, PlayerPublic } from "@mafioo/shared";
import { xpToNextLevel } from "./xp.js";

export function toPlayerPublic(player: Player): PlayerPublic {
  return {
    id: player.id,
    username: player.username,
    level: player.level,
    respect: player.respect,
    avatarId: player.avatarId,
    gangId: player.gangId,
    factionId: player.factionId,
    streetX: player.streetX,
    streetY: player.streetY,
  };
}

export function toPlayerMe(player: Player): PlayerMe {
  return {
    ...toPlayerPublic(player),
    email: player.email,
    xp: player.xp,
    xpToNextLevel: xpToNextLevel(player.level, player.xp),
    standing: player.standing,
    cash: player.cash,
    bankBalance: player.bankBalance,
    credits: player.credits,
    connections: player.connections,
    life: player.life,
    maxLife: player.maxLife,
    stamina: player.stamina,
    maxStamina: player.maxStamina,
    heat: player.heat,
    criminalRecord: player.criminalRecord,
    toxication: player.toxication,
    strength: player.strength,
    intellect: player.intellect,
    sexapeal: player.sexapeal,
    fitnessPoints: player.fitnessPoints,
    maxFitnessPoints: player.maxFitnessPoints,
    schoolPoints: player.schoolPoints,
    maxSchoolPoints: player.maxSchoolPoints,
    hookerPoints: player.hookerPoints,
    maxHookerPoints: player.maxHookerPoints,
    battlePoints: player.battlePoints,
    maxBattlePoints: player.maxBattlePoints,
    attackMode: player.attackMode,
    vipExpiresAt: player.vipExpiresAt ? player.vipExpiresAt.toISOString() : null,
    freeSkillPoints: player.freeSkillPoints,
  };
}

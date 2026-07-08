export const SKILL_KEYS = [
  "apprentice",
  "paramedic",
  "dog",
  "pimp",
  "driver",
  "spy",
  "businessman",
  "leader",
  "fighter",
  "assassin",
] as const;
export type SkillKey = (typeof SKILL_KEYS)[number];

export const ATTACK_MODES = ["normal", "defensive", "aggressive"] as const;
export type AttackMode = (typeof ATTACK_MODES)[number];

export const DAY_TYPES = [
  "strength",
  "intellect",
  "experience",
  "sexapeal",
  "manufacturer",
  "fight",
  "smuggler",
] as const;
export type DayType = (typeof DAY_TYPES)[number];

export const ITEM_CATEGORIES = [
  "gun",
  "drink",
  "hooker",
  "card",
  "blueprint",
  "consumable",
  "booster",
  "grenade",
  "car",
  "dog",
  "credit_pack",
  "special",
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const MAP_TYPES = ["street", "city"] as const;
export type MapType = (typeof MAP_TYPES)[number];

export const TOP10_METRICS = [
  "respect",
  "online",
  "experience",
  "victories",
  "arrests",
  "strength",
  "intellect",
  "sexapeal",
  "prison_breaks",
  "level",
  "rackets",
  "crimes",
  "criminal_record",
] as const;
export type Top10Metric = (typeof TOP10_METRICS)[number];

export interface PlayerPublic {
  id: string;
  username: string;
  level: number;
  respect: number;
  avatarId: number;
  gangId: string | null;
  factionId: string | null;
  streetX: number;
  streetY: number;
}

export interface PlayerMe extends PlayerPublic {
  email: string;
  xp: number;
  xpToNextLevel: number;
  standing: number;
  cash: number;
  bankBalance: number;
  credits: number;
  connections: number;
  life: number;
  maxLife: number;
  stamina: number;
  maxStamina: number;
  heat: number;
  criminalRecord: number;
  toxication: number;
  strength: number;
  intellect: number;
  sexapeal: number;
  fitnessPoints: number;
  maxFitnessPoints: number;
  schoolPoints: number;
  maxSchoolPoints: number;
  hookerPoints: number;
  maxHookerPoints: number;
  battlePoints: number;
  maxBattlePoints: number;
  attackMode: AttackMode;
  vipExpiresAt: string | null;
  freeSkillPoints: number;
}

export interface AuthRegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthLoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  player: PlayerMe;
}

export interface MapSpotDef {
  id: string;
  label: string;
  cashCost: number;
  staminaCost: number;
  riskPercent: number;
  rewardMin: number;
  rewardMax: number;
}

export interface MapTileResponse {
  type: MapType;
  x: number;
  y: number;
  owner: PlayerPublic | null;
  spots: MapSpotDef[];
  neighbors: { dx: number; dy: number; x: number; y: number }[];
}

export interface CrimeActionResult {
  success: boolean;
  cashDelta: number;
  xpDelta: number;
  heatDelta: number;
  message: string;
  player: PlayerMe;
}

export interface InventoryItemDto {
  id: string;
  itemTypeId: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  equippedSlot: string | null;
  sellCash: number;
}

export interface BankTransactionRequest {
  amount: number;
}

export interface MessageDto {
  id: string;
  senderId: string;
  senderUsername: string;
  recipientId: string;
  recipientUsername: string;
  subject: string;
  body: string;
  folder: "inbox" | "sent" | "saved";
  readAt: string | null;
  createdAt: string;
}

export interface SendMessageRequest {
  recipientUsername: string;
  subject: string;
  body: string;
}

export interface FriendDto {
  id: string;
  friend: PlayerPublic;
  status: "pending" | "accepted";
}

export interface Top10Row {
  rank: number;
  player: PlayerPublic;
  value: number;
}

export interface CrimeLogEntry {
  id: string;
  type: string;
  attacker: PlayerPublic;
  victim: PlayerPublic;
  result: "victory" | "loss";
  createdAt: string;
}

export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}

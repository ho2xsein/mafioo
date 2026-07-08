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

export const AVATAR_IDS: number[] = [
  -120, -119, -118, -117, -116, -115, -114, -113, -112, -111, -110, -109, -108, -107, -106, -105,
  -104, -103, -102, -101, -64, -63, -62, -61, -60, -59, -58, -57, -56, -55, -54, -53, -52, -51,
  -50, -46, -45, -44, -43, -42, -41, -35, -34, -33, -32, -31, -21, -19, -18, -17, -16, -15, -14,
  -13, -12, -11, -9, -8, -7, -6, -5, -4, -3, -2, -1,
];

export function avatarUrl(avatarId: number): string {
  return AVATAR_IDS.includes(avatarId) ? `/avatars/a${avatarId}.gif` : "/avatars/a-1.gif";
}

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
  icon: string | null;
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

export interface BarSummary {
  id: string;
  name: string;
  type: string;
  rating: number;
  ownerUsername: string | null;
}

export interface BarItemDto {
  id: string;
  itemTypeId: string;
  name: string;
  category: ItemCategory;
  icon: string | null;
  buyCash: number;
  requiredLevel: number;
  quantityAvailable: number;
  maxQuantity: number;
  nextAvailableAt: string | null;
}

export interface BarUseResult {
  message: string;
  player: PlayerMe;
}

export interface SetAvatarRequest {
  avatarId: number;
}

export interface ApiError {
  error: string;
  fields?: Record<string, string>;
}

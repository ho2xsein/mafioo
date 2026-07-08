import { prisma } from "./lib/prisma.js";
import { SKILL_KEYS } from "@mafioo/shared";

const SKILL_INFO: Record<(typeof SKILL_KEYS)[number], string> = {
  apprentice: "Reduces crime failure risk.",
  paramedic: "+1 life/level, +2 stamina/level.",
  dog: "Improves guard dog effectiveness.",
  pimp: "Boosts hooker/bar income.",
  driver: "Improves getaway success on crimes.",
  spy: "Reveals more info on other players.",
  businessman: "Increases racket income.",
  leader: "Boosts gang-wide bonuses.",
  fighter: "+attack per level.",
  assassin: "+critical hit chance in fights.",
};

const STREET_SPOTS = [
  { spotKey: "atm", label: "ATM", cashCost: 0, staminaCost: 5, riskPercent: 15, rewardMin: 200, rewardMax: 800 },
  { spotKey: "mobster", label: "Mobster", cashCost: 0, staminaCost: 8, riskPercent: 25, rewardMin: 500, rewardMax: 1500 },
  { spotKey: "businessman", label: "Businessman", cashCost: 0, staminaCost: 10, riskPercent: 20, rewardMin: 800, rewardMax: 2200 },
  { spotKey: "shiny_car", label: "Shiny car", cashCost: 0, staminaCost: 12, riskPercent: 35, rewardMin: 1000, rewardMax: 3000 },
];

const CITY_SPOTS = [
  { spotKey: "patrol_officer", label: "Patrol officer", cashCost: 0, staminaCost: 6, riskPercent: 30, rewardMin: 100, rewardMax: 400 },
  { spotKey: "drunkard", label: "Drunkard", cashCost: 0, staminaCost: 3, riskPercent: 5, rewardMin: 50, rewardMax: 200 },
  { spotKey: "mailbox", label: "Mailbox", cashCost: 0, staminaCost: 2, riskPercent: 10, rewardMin: 30, rewardMax: 150 },
  { spotKey: "housewife", label: "Housewife", cashCost: 0, staminaCost: 4, riskPercent: 12, rewardMin: 100, rewardMax: 300 },
  { spotKey: "chick", label: "Chick", cashCost: 0, staminaCost: 3, riskPercent: 8, rewardMin: 50, rewardMax: 180 },
  { spotKey: "phonebooth", label: "Phonebooth", cashCost: 0, staminaCost: 3, riskPercent: 10, rewardMin: 60, rewardMax: 220 },
  { spotKey: "ambulance", label: "Ambulance", cashCost: 0, staminaCost: 10, riskPercent: 28, rewardMin: 400, rewardMax: 1200 },
  { spotKey: "biker", label: "Biker", cashCost: 0, staminaCost: 9, riskPercent: 22, rewardMin: 300, rewardMax: 900 },
  { spotKey: "safe_cracker", label: "Safe-cracker", cashCost: 0, staminaCost: 15, riskPercent: 45, rewardMin: 1500, rewardMax: 4000 },
  { spotKey: "salesman", label: "Salesman", cashCost: 0, staminaCost: 5, riskPercent: 14, rewardMin: 150, rewardMax: 500 },
  { spotKey: "yellow_cab", label: "Yellow cab", cashCost: 0, staminaCost: 6, riskPercent: 18, rewardMin: 200, rewardMax: 600 },
  { spotKey: "robbery", label: "Robbery", cashCost: 0, staminaCost: 14, riskPercent: 40, rewardMin: 1200, rewardMax: 3500 },
  { spotKey: "business_lady", label: "Business lady", cashCost: 0, staminaCost: 8, riskPercent: 20, rewardMin: 400, rewardMax: 1100 },
  { spotKey: "thief", label: "Thief", cashCost: 0, staminaCost: 7, riskPercent: 24, rewardMin: 250, rewardMax: 800 },
  { spotKey: "dealer", label: "Dealer", cashCost: 0, staminaCost: 11, riskPercent: 32, rewardMin: 700, rewardMax: 2000 },
];

const ITEM_TYPES = [
  { typeId: 7924, name: "Soda", category: "drink" as const, icon: "/bar/soda.jpg", buyCash: 50, sellCash: 10, effect: { stamina: 20, toxication: 0 } },
  { typeId: 3778, name: "Whiskey", category: "drink" as const, icon: "/bar/whiskey.jpg", buyCash: 300, sellCash: 60, effect: { stamina: 120, toxication: 5 } },
  { typeId: 2411, name: "Berta", category: "hooker" as const, icon: "/bar/hooker_12.jpg", buyCash: 1, sellCash: 0, effect: { sexapeal: 20 }, requiredLevel: 1 },
  { typeId: 2412, name: "Norah", category: "hooker" as const, icon: "/bar/hooker_13.jpg", buyCash: 1, sellCash: 0, effect: { sexapeal: 22 }, requiredLevel: 1 },
  { typeId: 4738, name: "Gerri", category: "hooker" as const, icon: "/bar/hooker_14.jpg", buyCash: 1, sellCash: 0, effect: { sexapeal: 25 }, requiredLevel: 3 },
  { typeId: 3460, name: "Lilly", category: "hooker" as const, icon: "/bar/hooker_15.jpg", buyCash: 1, sellCash: 0, effect: { sexapeal: 27 }, requiredLevel: 3 },
  { typeId: 2410, name: "Suzzie", category: "hooker" as const, icon: "/bar/hooker_16.jpg", buyCash: 1, sellCash: 0, effect: { sexapeal: 30 }, requiredLevel: 5 },
  { typeId: 4832, name: "Vikki", category: "hooker" as const, icon: "/bar/hooker_17.jpg", buyCash: 1, sellCash: 0, effect: { sexapeal: 32 }, requiredLevel: 5 },
  { typeId: 4833, name: "Daisy", category: "hooker" as const, icon: "/bar/hooker_18.jpg", buyCash: 1, sellCash: 0, effect: { sexapeal: 35 }, requiredLevel: 8 },
  { typeId: 8263, name: "Carmen", category: "hooker" as const, icon: "/bar/hooker_19.jpg", buyCash: 1, sellCash: 0, effect: { sexapeal: 38 }, requiredLevel: 10 },
  { typeId: 8264, name: "Annie", category: "hooker" as const, icon: "/bar/hooker_20.jpg", buyCash: 1, sellCash: 0, effect: { sexapeal: 40 }, requiredLevel: 12 },
  { typeId: 801, name: "Cash stash", category: "consumable" as const, buyCash: 0, sellCash: 150, effect: { cash: 1000 } },
  { typeId: 812, name: "Agent voucher", category: "consumable" as const, buyCash: 0, sellCash: 50, effect: { agentAttacks: 1 } },
  { typeId: 813, name: "Get Out of Jail card", category: "card" as const, buyCash: 0, sellCash: 200, effect: { jailRelease: true } },
  { typeId: 901, name: "Pocket knife", category: "gun" as const, icon: "/icons/gun.jpg", buyCash: 2000, sellCash: 400, effect: { attack: 15 } },
  { typeId: 902, name: "Revolver", category: "gun" as const, icon: "/icons/gun.jpg", buyCash: 8000, sellCash: 1600, effect: { attack: 40 } },
  { typeId: 950, name: "Old sedan", category: "car" as const, icon: "/icons/car.jpg", buyCash: 5000, sellCash: 1000, effect: { getawayBonus: 10 } },
  { typeId: 960, name: "Guard dog", category: "dog" as const, icon: "/icons/dog.jpg", buyCash: 3000, sellCash: 600, effect: { defence: 5 } },
  { typeId: 970, name: "Frag grenade", category: "grenade" as const, icon: "/icons/grenade.jpg", buyCash: 1500, sellCash: 300, effect: { blastDamage: 20 } },
];

const EXTRAS = [
  { extraId: 1, name: "VIP Gangster", description: "7 days of VIP perks.", priceCredits: 20, durationHours: 168 },
  { extraId: 210, name: "Battle Fury", description: "Extra battle points.", priceCredits: 8, durationHours: 24 },
  { extraId: 226, name: "Agent Spy", description: "Auto-locate weaker agents.", priceCredits: 20, durationHours: 72 },
  { extraId: 230, name: "Agent attacks", description: "+20 agent attacks/day.", priceCredits: 10, durationHours: 168 },
  { extraId: 232, name: "Mentor", description: "Refill School points once.", priceCredits: 3, durationHours: 0 },
  { extraId: 234, name: "Trainer", description: "Refill Fitness points once.", priceCredits: 3, durationHours: 0 },
  { extraId: 236, name: "Lady Magnet", description: "2x hooker points for a day.", priceCredits: 6, durationHours: 24 },
  { extraId: 238, name: "Battle Fury (map)", description: "Extra battle points from street.", priceCredits: 8, durationHours: 24 },
  { extraId: 351, name: "Mentor refill", description: "Refill School points instantly.", priceCredits: 2, durationHours: 0 },
];

async function main() {
  console.log("Seeding skills...");
  for (const key of SKILL_KEYS) {
    await prisma.skill.upsert({
      where: { key },
      update: {},
      create: { key, name: key[0].toUpperCase() + key.slice(1), description: SKILL_INFO[key] },
    });
  }

  console.log("Seeding map spots...");
  for (const spot of STREET_SPOTS) {
    await prisma.mapSpot.upsert({
      where: { mapType_spotKey: { mapType: "street", spotKey: spot.spotKey } },
      update: spot,
      create: { mapType: "street", ...spot },
    });
  }
  for (const spot of CITY_SPOTS) {
    await prisma.mapSpot.upsert({
      where: { mapType_spotKey: { mapType: "city", spotKey: spot.spotKey } },
      update: spot,
      create: { mapType: "city", ...spot },
    });
  }

  console.log("Seeding item types...");
  for (const item of ITEM_TYPES) {
    await prisma.itemType.upsert({
      where: { typeId: item.typeId },
      update: item,
      create: item,
    });
  }

  console.log("Seeding extras...");
  for (const extra of EXTRAS) {
    await prisma.extra.upsert({
      where: { extraId: extra.extraId },
      update: extra,
      create: extra,
    });
  }

  console.log("Seeding a starter bar...");
  const bar = await prisma.bar.upsert({
    where: { id: "seed-bar-1" },
    update: {},
    create: { id: "seed-bar-1", name: "The Hideout", type: "hotel", rating: 3 },
  });
  const barStock: { typeId: number; quantity: number }[] = [
    { typeId: 7924, quantity: 40 },
    { typeId: 3778, quantity: 20 },
    { typeId: 2411, quantity: 5 },
    { typeId: 2412, quantity: 4 },
    { typeId: 4738, quantity: 3 },
    { typeId: 3460, quantity: 3 },
    { typeId: 2410, quantity: 2 },
  ];
  for (const stock of barStock) {
    const itemType = await prisma.itemType.findUniqueOrThrow({ where: { typeId: stock.typeId } });
    await prisma.barItem.upsert({
      where: { barId_itemTypeId: { barId: bar.id, itemTypeId: itemType.id } },
      update: {},
      create: {
        barId: bar.id,
        itemTypeId: itemType.id,
        quantityAvailable: stock.quantity,
        maxQuantity: stock.quantity,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

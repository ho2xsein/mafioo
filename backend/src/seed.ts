import { prisma } from "./lib/prisma.js";
import { SKILL_KEYS } from "@mafioo/shared";

// ---------- Skills (real descriptions + unlock levels mined from the source game) ----------

const SKILL_INFO: Record<(typeof SKILL_KEYS)[number], { name: string; description: string; unlockLevel: number }> = {
  apprentice: {
    name: "Apprentice",
    description: "You gain experience faster (+3%/level).",
    unlockLevel: 6,
  },
  paramedic: {
    name: "Paramedic",
    description:
      "Gain more life and stamina and lose more intoxication per minute (+1/level). In a gang fight, increases life (+1/level) and stamina (+2/level) every round for every gang member.",
    unlockLevel: 1,
  },
  dog: {
    name: "Dog",
    description: "Increases maximum stamina (+10/level). Increases maximum toxication (+5/level).",
    unlockLevel: 10,
  },
  pimp: {
    name: "Pimp",
    description: "Hookers give more sexapeal (+10%/level).",
    unlockLevel: 1,
  },
  driver: {
    name: "Driver",
    description: "Heat decreases faster (30%/level). Stronger defense (1%/level). Harder to be hit by a grenade.",
    unlockLevel: 1,
  },
  spy: {
    name: "Spy",
    description:
      "See more info about other players. Every level increases your chance to steal something by 2% and decreases others' chance to steal from you by 1%.",
    unlockLevel: 6,
  },
  businessman: {
    name: "Businessman",
    description:
      "You can build hotels, bars and factories. Increases racket income (+3%/level). Increases the loan limit (+100,000/level).",
    unlockLevel: 7,
  },
  leader: {
    name: "Leader",
    description: "Increases every gang-member's abilities (+3%/level) in a gang fight. Increases gang racket attack.",
    unlockLevel: 8,
  },
  fighter: {
    name: "Fighter",
    description: "Increases maximum life (+3/level). Increases arrest heat (+10/level). More racket defense (+6%/level).",
    unlockLevel: 9,
  },
  assassin: {
    name: "Assassin",
    description: "Increases attack (+3%/level). More accuracy throwing grenades.",
    unlockLevel: 10,
  },
};

// ---------- Map crime actions ----------
// Names, stamina costs and reward values are mined verbatim from the source game's MAP JSON.
// Risk% wasn't recoverable from the static scrape (the original UI never displayed it), so it's
// derived heuristically here: 0 for "flavor" actions with reward <= 0, otherwise scaled with
// stamina cost (harder/pricier actions are assumed riskier).
type ActionTuple = [action: string, stamina: number, reward: number];

function deriveRisk(reward: number, stamina: number): number {
  if (reward <= 0) return 0;
  return Math.min(60, Math.max(5, Math.round(stamina * 0.9)));
}

function buildActions(mapType: "street" | "city", spots: [spot: string, actions: ActionTuple[]][]) {
  const rows: {
    mapType: "street" | "city";
    spotKey: string;
    spotLabel: string;
    actionLabel: string;
    staminaCost: number;
    reward: number;
    riskPercent: number;
    sortOrder: number;
  }[] = [];
  let sortOrder = 0;
  for (const [spotLabel, actions] of spots) {
    for (const [actionLabel, stamina, reward] of actions) {
      sortOrder += 1;
      const slug = `${spotLabel}_${actionLabel}`.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      rows.push({
        mapType,
        spotKey: slug,
        spotLabel,
        actionLabel,
        staminaCost: stamina,
        reward,
        riskPercent: deriveRisk(reward, stamina),
        sortOrder,
      });
    }
  }
  return rows;
}

const STREET_SPOTS: [string, ActionTuple[]][] = [
  ["ATM", [["Break", 45, 55], ["Hack", 50, 65]]],
  ["Mobster", [["Cheat the Bastard", 25, 16], ["Steal the goldlace", 35, 8], ["Beat up the mobster", 45, 25]]],
  [
    "Businessman",
    [
      ["Ask for advice", 40, -1],
      ["Steal the Rolex", 25, 12],
      ["Run a deal", 30, 8],
      ["Beat him up", 40, 40],
      ["Blackmail", 45, 55],
    ],
  ],
  ["Shiny car", [["Steal the CD player", 25, 8], ["Break the headlights", 35, 8], ["Steal the car", 45, 60]]],
  [
    "Dude",
    [
      ["Offer a smoke", 5, 2],
      ["Punch in the nose", 25, 25],
      ["Steal the tires", 35, 8],
      ["Steal the car", 45, 60],
    ],
  ],
  ["Hookers", [["Offer a smoke", 15, 2], ["Get the cash", 30, 16], ["Give a shiner", 45, 16]]],
  [
    "Manager",
    [
      ["Ask for advice", 20, -1],
      ["Snatch the phone", 25, 24],
      ["Steal the laptop", 30, 24],
      ["Punch in the eye", 45, 24],
    ],
  ],
  [
    "Business lady",
    [
      ["Make a compliment", 10, -1],
      ["Call a taxi", 20, 0],
      ["Snatch the purse", 30, 8],
      ["Invite to dinner", 30, -1],
    ],
  ],
  [
    "Drug dealer",
    [
      ["Call the cops", 30, -2],
      ["Snatch the cash", 15, 16],
      ["Get the goods", 35, 20],
      ["Punch in the eye", 20, 32],
    ],
  ],
  ["Hooligan", [["Empty the pockets", 20, 8], ["Punch", 30, 8]]],
  ["Phonebooth", [["Call home", 10, -1], ["Steal the coins", 30, 30], ["Smash", 35, 40]]],
  [
    "Yupiee",
    [
      ["Pinch the Credit card", 25, 16],
      ["Snatch the phone", 30, 16],
      ["Snatch the briefcase", 30, 12],
      ["Kick", 35, 16],
    ],
  ],
  ["Yellow cab", [["Get the turnover", 25, 16], ["Snatch the radio", 30, 25], ["Kick the bastard", 35, 45]]],
  ["Teacher", [["Ask out for coffee", 15, 0], ["Snatch the book", 15, 8], ["Give a shiner", 20, 5]]],
  ["Mailbox", [["Rob", 20, 16], ["Smash", 30, 40]]],
  [
    "Soccer guy",
    [["Play a game", 30, -2], ["Blow the ball", 15, 8], ["Empty the pockets", 25, 16], ["Beat", 35, 35]],
  ],
  ["Road sign", [["Scribble", 15, 16], ["Smash", 30, 30]]],
  ["Porter", [["Rob", 15, 15], ["Kick down", 30, 30]]],
  ["Mother", [["Help with the cart", 30, -2], ["Snatch the purse", 20, 25], ["Snatch the plaything", 10, 3]]],
  [
    "Dude with a dog",
    [
      ["Offer a smoke", 15, 1],
      ["Pinch his pockets", 20, 4],
      ["Beat him up", 30, 25],
      ["Steal the dog", 30, 8],
    ],
  ],
  ["Biker", [["Push down", 15, 8], ["Jack the backpack", 30, 12]]],
  [
    "Chick with a dog",
    [
      ["Offer a smoke", 15, 1],
      ["Ask out for coffee", 15, 0],
      ["Rob", 15, 12],
      ["Steal a kiss", 30, 8],
      ["Steal the dog", 25, 7],
    ],
  ],
  ["Slacker", [["Give a smoke", 25, 1], ["Give a pillow", 20, -1], ["Rob", 15, 8], ["Give a shiner", 30, 8]]],
  ["Old car", [["Leak the gas", 15, 7], ["Snatch the tires", 25, 6], ["Write WASH ME", 5, 6]]],
  ["Hydrant", [["Sell", 20, 8], ["Smash", 30, 25]]],
  ["Skater", [["Rob", 10, 3], ["Steal the phone", 15, 3], ["Kick down", 20, 3], ["Skate", 20, 2]]],
  ["Chick", [["Rob", 20, 8], ["Ask out for coffee", 15, 4], ["Steal a kiss", 20, 8]]],
  ["Barrels", [["Set on fire", 8, 40], ["Sell", 15, 8]]],
  ["Baricade", [["Sell", 5, 4], ["Smash", 5, 6]]],
  ["Shaft", [["Sell", 5, 1], ["Smash", 5, 2], ["Fix", 5, -1]]],
  ["Dog", [["Send to shelter", 5, -2], ["Sell", 5, 2], ["Throw a stick", 5, 0], ["Walk", 5, 0]]],
  ["Drunkard", [["Rob", 5, 2], ["Kick down", 5, 1], ["Give bucks", 5, -1], ["Send to detox", 5, -1]]],
  ["Garbage cans", [["Clean up", 5, -1], ["Kick down", 5, 1]]],
  ["Postman", [["Rob", 15, 3], ["Cheat", 10, 2], ["Help with boxes", 15, -1]]],
  [
    "Couple in love",
    [["Rob", 5, 2], ["Kick down", 5, 2], ["Pinch the chick", 5, 1], ["Tweak the dude", 5, 1]],
  ],
  [
    "Little girl",
    [["Get the icecream", 5, 0], ["Scare", 5, 0], ["Empty the pockets", 5, 0], ["Send to school", 5, -1]],
  ],
];

const CITY_SPOTS: [string, ActionTuple[]][] = [
  ["Patrol officer", [["Offer a smoke", 3, -4], ["Give a donut", 4, -4]]],
  ["Drunkard", [["Kick down", 15, 10], ["Send to detox", 15, -2]]],
  ["Mailbox", [["Rob", 5, 10], ["Smash", 5, 10]]],
  ["Nurse", [["Walk across the street", 5, 0], ["Call a taxi", 5, 0]]],
  ["Housewife", [["Rob", 10, 20], ["Help with boxes", 10, 2]]],
  ["No entry", [["Break", 10, 20]]],
  ["One way", [["Break", 10, 20]]],
  ["No entry (alley)", [["Break", 10, 200]]],
  ["Gents", [["Have a chat", 20, 6], ["Piss 'em Off", 30, 40]]],
  ["Chick", [["Rob", 20, 40], ["Ask out for coffee", 25, 10], ["Steal a kiss", 30, 18]]],
  ["Family", [["Steal the dog", 30, 40], ["Snatch the purse", 20, 60]]],
  ["Smart fellows", [["Buy them a drink", 10, 4], ["Kick 'em", 10, 40]]],
  ["Phonebooth", [["Call home", 10, -2], ["Steal the coins", 25, 40], ["Smash", 30, 70]]],
  ["Ambulance", [["Steal the siren", 25, 70], ["Steal the bumper", 20, 60], ["Write WASH ME", 15, 20]]],
  ["Biker", [["Push down", 15, 40], ["Jack the backpack", 30, 50]]],
  ["Safe-cracker", [["Take the loot", 30, 30], ["Call the cops", 10, -4]]],
  ["Salesman", [["Beat", 20, 40], ["Run a deal", 30, 30]]],
  ["Yellow cab", [["Get the turnover", 25, 30], ["Snatch the radio", 35, 40], ["Kick the bastard", 45, 60]]],
  ["Robbery", [["Kick the bandit", 20, 70], ["Call the cops", 15, -6], ["Take the loot", 30, 60]]],
  [
    "Business lady",
    [
      ["Make a compliment", 10, -2],
      ["Call a taxi", 10, 2],
      ["Snatch the purse", 30, 50],
      ["Invite to dinner", 10, -2],
    ],
  ],
  ["Thief", [["Take the loot", 22, 46], ["Beat", 33, 74]]],
  ["Mobster", [["Cheat the Bastard", 20, 32], ["Steal the goldlace", 30, 56], ["Beat up the mobster", 35, 70]]],
  ["Pimp", [["Snatch the jacket", 15, 40], ["Beat", 20, 50], ["Snatch the cash", 35, 70]]],
  ["Police hound", [["Feed", 10, 4], ["Kick down", 30, 60]]],
  ["Dealer", [["Rob", 15, 60], ["Punch", 30, 70]]],
  [
    "Jeep",
    [
      ["Write WASH ME", 10, 6],
      ["Scratch the paint", 20, 50],
      ["Break the headlights", 35, 70],
      ["Take a ride", 10, 80],
    ],
  ],
];

// ---------- Items (real drink/hooker stats mined from the bar snapshot) ----------
// Hooker "stamina" values are a cost (stored negative); drink "stamina" values are a gain.

const ITEM_TYPES = [
  { typeId: 501, name: "Soda", category: "drink" as const, icon: "/bar/soda.jpg", buyCash: 500_000, sellCash: 10, effect: { stamina: 15, toxication: 1 } },
  { typeId: 505, name: "Whiskey", category: "drink" as const, icon: "/bar/whiskey.jpg", buyCash: 1, sellCash: 60, effect: { stamina: 120, toxication: 5 } },
  { typeId: 701, name: "Berta", category: "hooker" as const, icon: "/bar/hooker_12.jpg", buyCash: 1, sellCash: 0, effect: { stamina: -6, sexapeal: 1500 }, requiredLevel: 1 },
  { typeId: 702, name: "Norah", category: "hooker" as const, icon: "/bar/hooker_13.jpg", buyCash: 1, sellCash: 0, effect: { stamina: -8, sexapeal: 7500 }, requiredLevel: 6 },
  { typeId: 703, name: "Gerri", category: "hooker" as const, icon: "/bar/hooker_14.jpg", buyCash: 1, sellCash: 0, effect: { stamina: -10, sexapeal: 12000 }, requiredLevel: 12 },
  { typeId: 704, name: "Lilly", category: "hooker" as const, icon: "/bar/hooker_15.jpg", buyCash: 1, sellCash: 0, effect: { stamina: -12, sexapeal: 18000 }, requiredLevel: 18 },
  { typeId: 706, name: "Suzzie", category: "hooker" as const, icon: "/bar/hooker_16.jpg", buyCash: 1, sellCash: 0, effect: { stamina: -18, sexapeal: 34500 }, requiredLevel: 30 },
  { typeId: 707, name: "Vikki", category: "hooker" as const, icon: "/bar/hooker_17.jpg", buyCash: 1, sellCash: 0, effect: { stamina: -20, sexapeal: 45000 }, requiredLevel: 36 },
  { typeId: 708, name: "Daisy", category: "hooker" as const, icon: "/bar/hooker_18.jpg", buyCash: 1, sellCash: 0, effect: { stamina: -24, sexapeal: 57000 }, requiredLevel: 42 },
  { typeId: 709, name: "Carmen", category: "hooker" as const, icon: "/bar/hooker_19.jpg", buyCash: 1, sellCash: 0, effect: { stamina: -26, sexapeal: 69000 }, requiredLevel: 48 },
  { typeId: 710, name: "Annie", category: "hooker" as const, icon: "/bar/hooker_20.jpg", buyCash: 1, sellCash: 0, effect: { stamina: -28, sexapeal: 90000 }, requiredLevel: 54 },
  { typeId: 711, name: "Alex", category: "hooker" as const, icon: "/bar/hooker_21.jpg", buyCash: 1, sellCash: 0, effect: { stamina: -30, sexapeal: 108000 }, requiredLevel: 60 },
  { typeId: 801, name: "Cash stash", category: "consumable" as const, buyCash: 0, sellCash: 150, effect: { cash: 1000 } },
  { typeId: 803, name: "Refill Stamina", category: "consumable" as const, buyCash: 0, sellCash: 150, effect: {} },
  { typeId: 804, name: "Refill Life", category: "consumable" as const, buyCash: 0, sellCash: 150, effect: {} },
  { typeId: 806, name: "Clear Heat", category: "consumable" as const, buyCash: 0, sellCash: 375, effect: {} },
  { typeId: 808, name: "Cash +10k", category: "consumable" as const, buyCash: 0, sellCash: 1500, effect: { cash: 10000 } },
  { typeId: 813, name: "Get Out of Jail card", category: "card" as const, buyCash: 0, sellCash: 1500, effect: { jailRelease: true } },
  { typeId: 817, name: "Battle Points +3", category: "card" as const, buyCash: 0, sellCash: 5000, effect: {} },
  { typeId: 836, name: "Arrest Points +1", category: "card" as const, buyCash: 0, sellCash: 1500, effect: {} },
  { typeId: 837, name: "Battle Fury 3 days", category: "booster" as const, buyCash: 0, sellCash: 15000, effect: {} },
  { typeId: 842, name: "Upgrade item +1 point", category: "card" as const, buyCash: 0, sellCash: 5500, effect: {} },
  { typeId: 844, name: "Safebox Combination", category: "card" as const, buyCash: 0, sellCash: 25, effect: {} },
  { typeId: 901, name: "Pocket knife", category: "gun" as const, icon: "/icons/gun.jpg", buyCash: 2000, sellCash: 400, effect: { attack: 15 } },
  { typeId: 902, name: "Revolver", category: "gun" as const, icon: "/icons/gun.jpg", buyCash: 8000, sellCash: 1600, effect: { attack: 40 } },
  { typeId: 950, name: "Old sedan", category: "car" as const, icon: "/icons/car.jpg", buyCash: 5000, sellCash: 1000, effect: { getawayBonus: 10 } },
  { typeId: 960, name: "Guard dog", category: "dog" as const, icon: "/icons/dog.jpg", buyCash: 3000, sellCash: 600, effect: { defence: 5 } },
  { typeId: 970, name: "Frag grenade", category: "grenade" as const, icon: "/icons/grenade.jpg", buyCash: 1500, sellCash: 300, effect: { blastDamage: 20 } },
];

// ---------- Extras / boosters (real catalog: extra_id, name, price, duration) ----------

const EXTRAS: {
  extraId: number;
  name: string;
  description: string;
  kind: string;
  priceCredits: number;
  durationHours: number;
}[] = [
  { extraId: 1, name: "VIP Gangster", description: "Silver star + VIP title, free racket collection, custom avatar, extended fight history, bigger bank deposit, quick cards.", kind: "vip", priceCredits: 20, durationHours: 168 },
  { extraId: 210, name: "Right hand", description: "+30% attack. Limit 0/4.", kind: "boost", priceCredits: 2, durationHours: 2 },
  { extraId: 211, name: "Left hand", description: "+30% defense. Limit 0/4.", kind: "boost", priceCredits: 2, durationHours: 2 },
  { extraId: 212, name: "Iron Curtain", description: "Grenade protection.", kind: "boost", priceCredits: 6, durationHours: 8 },
  { extraId: 216, name: "Faster attack cycles", description: "Attack the same opponent every 4h instead of 6h.", kind: "boost", priceCredits: 18, durationHours: 72 },
  { extraId: 226, name: "Agent Spy", description: "Auto-redirect to the correct street for an agent.", kind: "boost", priceCredits: 20, durationHours: 72 },
  { extraId: 230, name: "Agent attacks", description: "+20 more attacks/day vs agents.", kind: "boost", priceCredits: 10, durationHours: 168 },
  { extraId: 232, name: "Mentor", description: "2x max School points for 3 days.", kind: "boost", priceCredits: 9, durationHours: 72 },
  { extraId: 234, name: "Trainer", description: "2x max Fitness points for 3 days.", kind: "boost", priceCredits: 9, durationHours: 72 },
  { extraId: 236, name: "Lady Magnet", description: "2x max Hooker points for 3 days.", kind: "boost", priceCredits: 9, durationHours: 72 },
  { extraId: 238, name: "Battle Fury", description: "2x max Battle points for 3 days.", kind: "boost", priceCredits: 9, durationHours: 72 },
  { extraId: 240, name: "Manufacturer", description: "Factories produce 2x faster for 30 days.", kind: "boost", priceCredits: 50, durationHours: 720 },
  { extraId: 242, name: "Police Officer", description: "2x max arrest points for 3 days.", kind: "boost", priceCredits: 9, durationHours: 72 },
  { extraId: 251, name: "Scientist", description: "Laboratories research 2x faster for 30 days.", kind: "boost", priceCredits: 50, durationHours: 720 },
  { extraId: 300, name: "Fame", description: "+10% instant to cafes/clubs/hotels rating.", kind: "boost", priceCredits: 30, durationHours: 0 },
  { extraId: 351, name: "Refill 12 School Points", description: "One-time daily refill, only usable when points are at 0.", kind: "refill_school", priceCredits: 6, durationHours: 0 },
  { extraId: 352, name: "Refill 12 Fitness Points", description: "One-time daily refill, only usable when points are at 0.", kind: "refill_fitness", priceCredits: 6, durationHours: 0 },
  { extraId: 353, name: "Refill 12 Hooker Points", description: "One-time daily refill, only usable when points are at 0.", kind: "refill_hooker", priceCredits: 6, durationHours: 0 },
  { extraId: 803, name: "Refill Stamina", description: "Instantly refill your stamina.", kind: "refill_stamina", priceCredits: 3, durationHours: 0 },
];

async function main() {
  console.log("Seeding skills...");
  for (const key of SKILL_KEYS) {
    const info = SKILL_INFO[key];
    await prisma.skill.upsert({
      where: { key },
      update: { name: info.name, description: info.description, unlockLevel: info.unlockLevel },
      create: { key, name: info.name, description: info.description, unlockLevel: info.unlockLevel },
    });
  }

  console.log("Seeding map spots...");
  const streetRows = buildActions("street", STREET_SPOTS);
  const cityRows = buildActions("city", CITY_SPOTS);
  for (const row of [...streetRows, ...cityRows]) {
    await prisma.mapSpot.upsert({
      where: { mapType_spotKey: { mapType: row.mapType, spotKey: row.spotKey } },
      update: row,
      create: row,
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
    { typeId: 501, quantity: 40 },
    { typeId: 505, quantity: 20 },
    { typeId: 701, quantity: 8 },
    { typeId: 702, quantity: 6 },
    { typeId: 703, quantity: 1 },
    { typeId: 704, quantity: 3 },
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

  console.log(`Seed complete. ${streetRows.length} street actions, ${cityRows.length} city actions.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

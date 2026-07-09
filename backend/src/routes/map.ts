import { Router } from "express";
import type { MapSpot } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { applyRegenAndGet } from "../game/regen.js";
import { toPlayerMe, toPlayerPublic } from "../game/serialize.js";
import { performCrimeAction } from "../game/crime.js";
import type { CrimeActionResult, MapSpotGroup, MapTileResponse } from "@mafioo/shared";

export const mapRouter = Router();

const NEIGHBOR_OFFSETS = [
  { dx: -1, dy: -1 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: -1, dy: 1 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: 1 },
];

function groupSpots(spots: MapSpot[]): MapSpotGroup[] {
  const groups = new Map<string, MapSpotGroup>();
  for (const spot of spots) {
    let group = groups.get(spot.spotLabel);
    if (!group) {
      group = { spotLabel: spot.spotLabel, actions: [] };
      groups.set(spot.spotLabel, group);
    }
    group.actions.push({
      id: spot.id,
      spotLabel: spot.spotLabel,
      actionLabel: spot.actionLabel,
      cashCost: spot.cashCost,
      staminaCost: spot.staminaCost,
      riskPercent: spot.riskPercent,
      reward: spot.reward,
    });
  }
  return [...groups.values()];
}

mapRouter.get(
  "/city",
  requireAuth,
  asyncHandler(async (_req, res) => {
    const spots = await prisma.mapSpot.findMany({ where: { mapType: "city" }, orderBy: { sortOrder: "asc" } });
    const response: MapTileResponse = {
      type: "city",
      x: 0,
      y: 0,
      owner: null,
      spotGroups: groupSpots(spots),
      neighbors: [],
    };
    res.json(response);
  }),
);

mapRouter.get(
  "/street/:x/:y",
  requireAuth,
  asyncHandler(async (req, res) => {
    const x = Number(req.params.x);
    const y = Number(req.params.y);
    if (!Number.isInteger(x) || !Number.isInteger(y)) throw new HttpError(400, "Invalid coordinates");

    const owner = await prisma.player.findFirst({ where: { streetX: x, streetY: y } });
    const spots = owner
      ? await prisma.mapSpot.findMany({ where: { mapType: "street" }, orderBy: { sortOrder: "asc" } })
      : [];

    const response: MapTileResponse = {
      type: "street",
      x,
      y,
      owner: owner ? toPlayerPublic(owner) : null,
      spotGroups: groupSpots(spots),
      neighbors: NEIGHBOR_OFFSETS.map(({ dx, dy }) => ({ dx, dy, x: x + dx, y: y + dy })),
    };
    res.json(response);
  }),
);

mapRouter.post(
  "/crime/:spotId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const spot = await prisma.mapSpot.findUnique({ where: { id: req.params.spotId } });
    if (!spot) throw new HttpError(404, "Unknown spot");

    const player = await applyRegenAndGet(req.playerId!);
    const outcome = await performCrimeAction(player, spot);

    const result: CrimeActionResult = {
      success: outcome.success,
      cashDelta: outcome.cashDelta,
      respectDelta: outcome.respectDelta,
      xpDelta: outcome.xpDelta,
      heatDelta: outcome.heatDelta,
      leveledUpTo: outcome.leveledUpTo,
      message: outcome.message,
      player: toPlayerMe(outcome.updatedPlayer),
    };
    res.json(result);
  }),
);

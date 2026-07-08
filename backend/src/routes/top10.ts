import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { toPlayerPublic } from "../game/serialize.js";
import type { Top10Row } from "@mafioo/shared";
import type { Prisma } from "@prisma/client";

export const top10Router = Router();

// Metrics backed directly by a Player column. Others from the catalog (victories,
// arrests, rackets, crimes, prison_breaks, online) need dedicated counters/log
// aggregation and are added as those subsystems land.
const METRIC_COLUMNS: Record<string, keyof Prisma.PlayerOrderByWithRelationInput> = {
  respect: "respect",
  level: "level",
  strength: "strength",
  intellect: "intellect",
  sexapeal: "sexapeal",
  criminal_record: "criminalRecord",
};

top10Router.get(
  "/:metric",
  requireAuth,
  asyncHandler(async (req, res) => {
    const metric = req.params.metric;
    const column = METRIC_COLUMNS[metric];
    if (!column) throw new HttpError(400, `Unsupported metric: ${metric}`);

    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = 20;

    const players = await prisma.player.findMany({
      orderBy: { [column]: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const rows: Top10Row[] = players.map((p, idx) => ({
      rank: (page - 1) * pageSize + idx + 1,
      player: toPlayerPublic(p),
      value: (p as unknown as Record<string, number>)[column as string],
    }));

    res.json({ rows });
  }),
);

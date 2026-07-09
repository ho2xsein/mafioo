import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { toPlayerMe } from "../game/serialize.js";
import { applyBankInterest } from "../game/bankInterest.js";

export const bankRouter = Router();

const MAX_BANK_BALANCE = 3_750_000;
const CASH_PER_CREDIT = 190_000;
const MAX_CREDITS_PER_EXCHANGE = 500;
const CASH_PER_CONNECTION = 100_000;
const MAX_CONNECTIONS_PER_EXCHANGE = 100;
const FREE_TRANSACTIONS_PER_DAY = 2;
const BANK_OPEN_HOUR = 6;
const BANK_CLOSE_HOUR = 20;

function assertBankOpen() {
  const hour = new Date().getUTCHours();
  if (hour < BANK_OPEN_HOUR || hour >= BANK_CLOSE_HOUR) {
    throw new HttpError(400, "Bank is closed — open 6:00-20:00");
  }
}

async function assertTransactionAllowance(playerId: string) {
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const count = await prisma.bankTransaction.count({
    where: { playerId, type: { in: ["deposit", "withdraw"] }, createdAt: { gte: startOfDay } },
  });
  if (count >= FREE_TRANSACTIONS_PER_DAY) {
    throw new HttpError(400, `Daily transaction limit reached (${FREE_TRANSACTIONS_PER_DAY}/day)`);
  }
}

const amountSchema = z.object({ amount: z.number().int().positive() });

bankRouter.post(
  "/deposit",
  requireAuth,
  asyncHandler(async (req, res) => {
    assertBankOpen();
    const { amount } = amountSchema.parse(req.body);
    await assertTransactionAllowance(req.playerId!);
    const player = await applyBankInterest(req.playerId!);

    if (amount > player.cash) throw new HttpError(400, "Not enough cash on hand");
    if (player.bankBalance + amount > MAX_BANK_BALANCE) {
      throw new HttpError(400, `Bank balance cannot exceed ${MAX_BANK_BALANCE.toLocaleString()}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.player.update({
        where: { id: player.id },
        data: { cash: player.cash - amount, bankBalance: player.bankBalance + amount },
      });
      await tx.bankTransaction.create({ data: { playerId: player.id, type: "deposit", amount } });
      return p;
    });

    res.json({ player: toPlayerMe(updated) });
  }),
);

bankRouter.post(
  "/withdraw",
  requireAuth,
  asyncHandler(async (req, res) => {
    assertBankOpen();
    const { amount } = amountSchema.parse(req.body);
    await assertTransactionAllowance(req.playerId!);
    const player = await applyBankInterest(req.playerId!);

    if (amount > player.bankBalance) throw new HttpError(400, "Not enough in bank");

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.player.update({
        where: { id: player.id },
        data: { cash: player.cash + amount, bankBalance: player.bankBalance - amount },
      });
      await tx.bankTransaction.create({ data: { playerId: player.id, type: "withdraw", amount } });
      return p;
    });

    res.json({ player: toPlayerMe(updated) });
  }),
);

const creditsSchema = z.object({ credits: z.number().int().positive().max(MAX_CREDITS_PER_EXCHANGE) });

bankRouter.post(
  "/buy-cash",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { credits } = creditsSchema.parse(req.body);
    const player = await applyBankInterest(req.playerId!);
    if (credits > player.credits) throw new HttpError(400, "Not enough credits");

    const cashGained = credits * CASH_PER_CREDIT;
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.player.update({
        where: { id: player.id },
        data: { credits: player.credits - credits, cash: player.cash + cashGained },
      });
      await tx.bankTransaction.create({ data: { playerId: player.id, type: "buy_cash", amount: cashGained } });
      return p;
    });

    res.json({ player: toPlayerMe(updated) });
  }),
);

const connectionsSchema = z.object({
  connections: z.number().int().positive().max(MAX_CONNECTIONS_PER_EXCHANGE),
});

bankRouter.post(
  "/buy-connections",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { connections } = connectionsSchema.parse(req.body);
    const player = await applyBankInterest(req.playerId!);

    const cashCost = connections * CASH_PER_CONNECTION;
    if (cashCost > player.cash) throw new HttpError(400, "Not enough cash");

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.player.update({
        where: { id: player.id },
        data: { cash: player.cash - cashCost, connections: player.connections + connections },
      });
      await tx.bankTransaction.create({
        data: { playerId: player.id, type: "buy_connections", amount: connections },
      });
      return p;
    });

    res.json({ player: toPlayerMe(updated) });
  }),
);

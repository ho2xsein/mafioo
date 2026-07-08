import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/httpError.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import type { MessageDto } from "@mafioo/shared";

export const msgRouter = Router();

function toMessageDto(
  msg: {
    id: string;
    senderId: string;
    recipientId: string;
    subject: string;
    body: string;
    folder: string;
    readAt: Date | null;
    createdAt: Date;
    sender: { username: string };
    recipient: { username: string };
  },
): MessageDto {
  return {
    id: msg.id,
    senderId: msg.senderId,
    senderUsername: msg.sender.username,
    recipientId: msg.recipientId,
    recipientUsername: msg.recipient.username,
    subject: msg.subject,
    body: msg.body,
    folder: msg.folder as MessageDto["folder"],
    readAt: msg.readAt ? msg.readAt.toISOString() : null,
    createdAt: msg.createdAt.toISOString(),
  };
}

msgRouter.get(
  "/inbox",
  requireAuth,
  asyncHandler(async (req, res) => {
    const messages = await prisma.message.findMany({
      where: { recipientId: req.playerId!, folder: "inbox" },
      include: { sender: true, recipient: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ messages: messages.map(toMessageDto) });
  }),
);

msgRouter.get(
  "/sent",
  requireAuth,
  asyncHandler(async (req, res) => {
    const messages = await prisma.message.findMany({
      where: { senderId: req.playerId!, folder: "sent" },
      include: { sender: true, recipient: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ messages: messages.map(toMessageDto) });
  }),
);

const sendSchema = z.object({
  recipientUsername: z.string().min(1),
  subject: z.string().min(1).max(120),
  body: z.string().min(1).max(4000),
});

msgRouter.post(
  "/send",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = sendSchema.parse(req.body);
    const recipient = await prisma.player.findUnique({ where: { username: data.recipientUsername } });
    if (!recipient) throw new HttpError(404, "Recipient not found");
    if (recipient.id === req.playerId) throw new HttpError(400, "Cannot message yourself");

    await prisma.$transaction([
      prisma.message.create({
        data: {
          senderId: req.playerId!,
          recipientId: recipient.id,
          subject: data.subject,
          body: data.body,
          folder: "inbox",
        },
      }),
      prisma.message.create({
        data: {
          senderId: req.playerId!,
          recipientId: recipient.id,
          subject: data.subject,
          body: data.body,
          folder: "sent",
        },
      }),
    ]);

    res.status(201).json({ ok: true });
  }),
);

msgRouter.post(
  "/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const message = await prisma.message.findUnique({ where: { id: req.params.id } });
    if (!message || message.recipientId !== req.playerId) throw new HttpError(404, "Message not found");

    const updated = await prisma.message.update({
      where: { id: message.id },
      data: { readAt: message.readAt ?? new Date() },
      include: { sender: true, recipient: true },
    });
    res.json({ message: toMessageDto(updated) });
  }),
);

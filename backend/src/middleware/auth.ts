import type { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/jwt.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      playerId?: string;
    }
  }
}

const COOKIE_NAME = "mafioo_token";
export { COOKIE_NAME };

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const payload = verifyToken(token);
    req.playerId = payload.playerId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session" });
  }
}

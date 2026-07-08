import jwt from "jsonwebtoken";
import { env } from "./env.js";

export interface AuthTokenPayload {
  playerId: string;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: "30d" });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
}

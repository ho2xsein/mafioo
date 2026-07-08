import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./lib/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { mapRouter } from "./routes/map.js";
import { bankRouter } from "./routes/bank.js";
import { msgRouter } from "./routes/msg.js";
import { friendRouter } from "./routes/friend.js";
import { top10Router } from "./routes/top10.js";
import { inventoryRouter } from "./routes/inventory.js";
import { crimeLogRouter } from "./routes/crimeLog.js";
import { profileRouter } from "./routes/profile.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.frontendOrigin, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/auth", authRouter);
  app.use("/map", mapRouter);
  app.use("/bank", bankRouter);
  app.use("/msg", msgRouter);
  app.use("/friend", friendRouter);
  app.use("/top10", top10Router);
  app.use("/inventory", inventoryRouter);
  app.use("/crime_log", crimeLogRouter);
  app.use("/profile", profileRouter);

  app.use(errorHandler);

  return app;
}

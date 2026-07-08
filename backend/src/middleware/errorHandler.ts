import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../lib/httpError.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, fields: err.fields });
    return;
  }
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of err.issues) {
      fields[issue.path.join(".")] = issue.message;
    }
    res.status(400).json({ error: "Validation failed", fields });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

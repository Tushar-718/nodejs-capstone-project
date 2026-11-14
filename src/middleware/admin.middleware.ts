import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { AUTH_TOKEN_STRINGS } from "../constants/string";
import { verifyAccessToken } from "../lib/jwt";

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (req.user?.role !== "ADMIN") {
    next(new AppError(403, AUTH_TOKEN_STRINGS.ADMIN_ACCESS_REQUIRED));
    return;
  }
  next();
}

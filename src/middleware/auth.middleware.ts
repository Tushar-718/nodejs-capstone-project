import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { AUTH_TOKEN_STRINGS } from "../constants/string";
import { verifyAccessToken } from "../lib/jwt";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, AUTH_TOKEN_STRINGS.AUTH_TOKEN_REQUIRED));
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return next(new AppError(401, AUTH_TOKEN_STRINGS.AUTH_TOKEN_REQUIRED));
  }
  try {
    req.user = verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
}

import { Request, Response } from "express";
import { COMMON_STRINGS } from "../constants/string";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: COMMON_STRINGS.ROUTE_NOT_FOUND,
  });
}

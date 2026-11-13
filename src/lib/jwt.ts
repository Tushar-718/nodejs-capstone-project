import { env } from "../config/env";
import { TokenPayload } from "../types/user";
import jwt, { SignOptions } from "jsonwebtoken";

export function signAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwtAccessExpiresIn as NonNullable<SignOptions["expiresIn"]>,
  };
  return jwt.sign(payload, env.jwtAccessSecret, options);
}

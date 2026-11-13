import { MINIMUM_PASSWORD_LENGTH } from "./../constants/validation";
import { AppError } from "../errors/AppError";
import { AUTH_STRINGS } from "../constants/string";
import { createSecureServer, findUserByEmail } from "../repositories/user.repository";
import bcrypt from "bcrypt";

export async function registerUser(email: string, password: string) {
  if (!email || !password) {
    throw new AppError(400, AUTH_STRINGS.CREDENTIALS_REQUIRED);
  }

  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new AppError(400, AUTH_STRINGS.PASSWORD_TOO_SHORT);
  }

  const normalizeEmail = email.toLowerCase().trim();

  const existingUser = await findUserByEmail(normalizeEmail);

  if (existingUser) {
    throw new AppError(409, AUTH_STRINGS.EMAIL_ALREADY_IN_USE);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await createSecureServer(normalizeEmail, passwordHash);
}

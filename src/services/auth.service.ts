import { MINIMUM_PASSWORD_LENGTH } from "./../constants/validation";
import { AppError } from "../errors/AppError";
import { AUTH_STRINGS } from "../constants/string";
import {
  createGoogleUser,
  createUser,
  findUserByEmail,
  findUserByEmailAndPassword,
  findUserByGoogleId,
  linkGoogleIdToUser,
} from "../repositories/user.repository";
import bcrypt from "bcrypt";
import { signAccessToken } from "../lib/jwt";
import { getGoogleAuthUrl, getGoogleUserFromAuthCode } from "../lib/google";
import { User } from "../types/user";

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

  await createUser(normalizeEmail, passwordHash);
}

export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    throw new AppError(400, AUTH_STRINGS.CREDENTIALS_REQUIRED);
  }

  const normalizeEmail = email.toLowerCase().trim();
  const user = await findUserByEmailAndPassword(normalizeEmail);

  if (!user?.password_hash) {
    throw new AppError(401, AUTH_STRINGS.INVALID_CREDENTIALS);
  }

  const isPasswordValid = await bcrypt.compare(password, user?.password_hash);

  if (!isPasswordValid) {
    throw new AppError(401, AUTH_STRINGS.INVALID_CREDENTIALS);
  }

  const accessToken = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return { accessToken };
}

export function startGoogleLogin(): string {
  return getGoogleAuthUrl();
}

function createAccessTokenForUser(user: User): string {
  return signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });
}

export async function loginWithGoogle(code: string): Promise<{ accessToken: string }> {
  const googleProfile = await getGoogleUserFromAuthCode(code);

  let user = await findUserByGoogleId(googleProfile.googleId);
  if (!user) {
    user = await findUserByEmail(googleProfile.email);

    if (user) {
      // link this google account to existing email user
      user = await linkGoogleIdToUser(user.id, googleProfile.googleId);
    } else {
      // first time login - create the user in postgresDB
      user = await createGoogleUser(googleProfile.email, googleProfile.googleId);
    }
  }

  const accessToken = createAccessTokenForUser(user);

  return { accessToken };
}

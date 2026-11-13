import { Router } from "express";
import { AUTH_STRINGS } from "../constants/string";
import { registerUser } from "../services/auth.service";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    await registerUser(email, password);
    res.status(201).json({
      success: true,
      message: AUTH_STRINGS.SIGNUP_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
});

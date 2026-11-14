import { Router } from "express";
import { AUTH_STRINGS } from "../constants/string";
import { loginUser, registerUser } from "../services/auth.service";
import { authenticate } from "../middleware/auth.middleware";

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

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { accessToken } = await loginUser(email, password);
    res.status(201).json({
      success: true,
      message: AUTH_STRINGS.LOGIN_SUCCESS,
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

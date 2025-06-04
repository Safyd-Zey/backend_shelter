import express from "express";
import {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
} from "../controllers/authController";
import { changePassword } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyEmail);
router.post("/resend-code", resendVerificationCode);
router.post("/login", login);
router.post("/change-password", authMiddleware, changePassword);
export default router;

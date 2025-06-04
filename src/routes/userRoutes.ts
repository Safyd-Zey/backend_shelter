import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  deactivateUser,
  getCurrentUser,
} from "../controllers/userController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
router.get("/me", authMiddleware, getCurrentUser);

router.get("/", authMiddleware, getAllUsers); // ✅ Защищено (только авторизованные пользователи)
router.get("/:id", authMiddleware, getUserById); // ✅ Защищено
router.put("/:id", authMiddleware, updateUser); // ✅ Защищено
router.delete("/:id", authMiddleware, deleteUser); // ✅ Защищено
router.patch("/:id", authMiddleware, deactivateUser); // Деактивизация объявления

export default router;

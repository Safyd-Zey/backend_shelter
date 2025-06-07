import express from 'express';
import { addToFavorites, removeFromFavorites, getFavorites } from '../controllers/favoritesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, addToFavorites); // ✅ Защищено
router.delete('/', authMiddleware, removeFromFavorites); // ✅ Защищено
router.get('/', authMiddleware, getFavorites); // ✅ Защищено

export default router;

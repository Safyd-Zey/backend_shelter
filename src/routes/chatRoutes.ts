import express from 'express';
import { getOrCreateChat, getUserChats,  getChatMessages } from '../controllers/chatController';
import { authMiddleware, chatMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, getOrCreateChat); // Создать или получить чат
router.get('/user', authMiddleware, getUserChats); // Получить чаты пользователя
router.get('/:chatId/messages', authMiddleware,chatMiddleware, getChatMessages); // Получить сообщения чата


export default router;

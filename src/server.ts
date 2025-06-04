import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import WebSocket from 'ws';
import http from 'http';
import path from 'path';

// Импорт маршрутов
import authRoutes from './routes/authRoutes';
import animalRoutes from './routes/animalRoutes';
import animalTypeRoutes from './routes/animalTypeRoutes'
import shelterRoutes from './routes/shelterRoutes';
import favoritesRoutes from './routes/favoritesRoutes';
import userRoutes from './routes/userRoutes';
import cloudinaryRoutes from './routes/cloudinaryRoutes';
import lostFoundRoutes from './routes/lostFoundRoutes';
import chatRoutes from './routes/chatRoutes';

// Импорт модели чатов
import { Chat } from './models/chat';

// Загрузка переменных окружения
dotenv.config();

// Создание Express-приложения
const app: Application = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(helmet());
app.use(morgan('dev'));

// Подключение к MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI as string;

console.log('⏳ Подключение к MongoDB...');

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB подключена'))
    .catch(err => console.error('❌ Ошибка подключения к MongoDB:', err));

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/types', animalTypeRoutes);
app.use('/api/shelters', shelterRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', cloudinaryRoutes);
app.use('/api/lost-found', lostFoundRoutes);
app.use('/api/chats', chatRoutes);

// Главная страница сервера
app.get('/', (req: Request, res: Response): void => {
    res.send('Сервер работает!');
});

// WebSocket-сервер
wss.on('connection', (ws) => {
    console.log(`📡 Пользователь подключился`);

    // Обработчик входящих сообщений
    ws.on('message', async (message: string) => {
        try {
            const { type, chatId, sender, text } = JSON.parse(message);

            if (!mongoose.Types.ObjectId.isValid(chatId)) {
                ws.send(JSON.stringify({ error: '❌ Неверный формат chatId' }));
                return;
            }

            const chatObjectId = new mongoose.Types.ObjectId(chatId); // Конвертация в ObjectId

            if (type === 'joinChat') {
                ws.send(JSON.stringify({ type: 'joined', chatId }));
                console.log(`👥 Пользователь присоединился к чату ${chatId}`);
            }

            if (type === 'sendMessage') {
                const chat = await Chat.findById(chatObjectId);
                if (!chat) {
                    ws.send(JSON.stringify({ error: '❌ Чат не найден' }));
                    return;
                }

                const newMessage = { sender, text, createdAt: new Date() };
                chat.messages.push(newMessage);
                await chat.save();

                // Рассылаем сообщение всем пользователям
                wss.clients.forEach(client => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'newMessage', chatId, newMessage }));
                    }
                });
            }
        } catch (error) {
            console.error('❌ Ошибка обработки WebSocket-сообщения:', error);
        }
    });

    // Отключение пользователя
    ws.on('close', () => {
        console.log(`❌ Пользователь отключился`);
    });
});

// Обработка ошибок
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('❌ Ошибка сервера:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));

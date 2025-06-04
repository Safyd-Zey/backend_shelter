// ws/websocket.ts
import WebSocket, { Server } from 'ws';
import { Chat } from '../models/chat';

const connectedClients: { [key: string]: WebSocket[] } = {};

export const initWebSocketServer = (server: any) => {
    const wss = new Server({ server });

    wss.on('connection', (ws: WebSocket, req: any) => {
        const chatId = req.url?.split('/')[2]; // Получаем chatId из URL
        if (!chatId) return;

        // Если комнаты нет, создаем ее
        if (!connectedClients[chatId]) {
            connectedClients[chatId] = [];
        }

        // Добавляем клиента в комнату
        connectedClients[chatId].push(ws);
        console.log(`Клиент подключен к комнате: ${chatId}`);

        ws.on('message', async (message: string) => {
            console.log(`Получено сообщение: ${message}`);

            const data = JSON.parse(message);
            const { text, sender } = data;

            // Сохранение сообщения в базе данных
            try {
                await Chat.findByIdAndUpdate(chatId, {
                    $push: { messages: { sender, text } },
                });
                console.log('Сообщение сохранено в базе данных');
            } catch (error) {
                console.error('Ошибка при сохранении сообщения:', error);
                return; // Останавливаем выполнение, если произошла ошибка
            }

            // Отправка сообщения всем клиентам в комнате
            connectedClients[chatId].forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ sender, text, createdAt: new Date() }));
                }
            });
        });

        ws.on('close', () => {
            console.log(`Клиент отключен от комнаты: ${chatId}`);
            // Удаляем клиента из комнаты
            connectedClients[chatId] = connectedClients[chatId].filter(client => client !== ws);
            if (connectedClients[chatId].length === 0) {
                delete connectedClients[chatId]; // Удаляем комнату, если она пустая
            }
        });
    });
};

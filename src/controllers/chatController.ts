import { Request, Response } from 'express';
import { Chat } from '../models/chat';
import mongoose from 'mongoose';
import { Shelter } from '../models/shelter';
import { User } from '../models/user';

// Создать или получить чат между пользователем и приютом
// export const getOrCreateChat = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const reqUser = await User.findById(req.user?.id)
//         if (!reqUser) {
//             res.status(404).json({ message: 'Пользователь не найден' });
//             return;
//         }
//         let user;
//         let shelterAdmin;
//         let shelter;
//         if(reqUser.role=="shelterAdmin"){
//             let { userId } = req.body;
//             shelterAdmin = reqUser;
//             user = await User.findById(userId);
//             if (!user) {
//                 res.status(404).json({ message: 'Пользователь не найден' });
//                 return;
//             }
//             shelter = await Shelter.findOne({admin: shelterAdmin});
//             if (!shelter) {
//                 res.status(404).json({ message: 'Приют не найден' });
//                 return;
//             }
//         }
//         else{
//             let { shelterId } = req.body;
//             shelter = await Shelter.findById(shelterId);
//         if (!shelter) {
//             res.status(404).json({ message: 'Приют не найден' });
//             return;
//         }
//         shelterAdmin = await User.findById(shelter.admin);
//         if (!shelterAdmin) {
//             res.status(404).json({ message: 'Владелец приюта не найден' });
//             return;
//         }
//         user = reqUser
//         }
//         // Ищем существующий чат
//         let chat = await Chat.findOne({ user: user, shelterAdmin: shelterAdmin }).populate('messages.sender', 'name');
        
//         // Если чата нет, создаем новый
//         if (!chat) {
//             chat = await Chat.create({ user: user, shelter:shelter ,shelterAdmin: shelterAdmin, messages: [] });
//         }
//         res.json(chat);
//     } catch (error) {
//         res.status(500).json({ message: 'Ошибка при создании чата', error });
//     };
// }

export const getOrCreateChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const reqUser = await User.findById(req.user?.id);
    if (!reqUser) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    const { chatType } = req.body;

    if (chatType === 'user-shelter') {
      const { userId, shelterId } = req.body;

      let user, shelterAdmin, shelter;

      if (reqUser.role === 'shelterAdmin') {
        if (!userId) {
          res.status(400).json({ message: 'userId обязателен для администратора приюта' });
          return;
        }

        user = await User.findById(userId);
        if (!user) {
          res.status(404).json({ message: 'Пользователь не найден' });
          return;
        }

        shelter = await Shelter.findOne({ admin: reqUser._id });
        if (!shelter) {
          res.status(404).json({ message: 'Приют не найден' });
          return;
        }

        shelterAdmin = reqUser;
      } else {
        if (!shelterId) {
          res.status(400).json({ message: 'shelterId обязателен для обычного пользователя' });
          return;
        }

        shelter = await Shelter.findById(shelterId);
        if (!shelter) {
          res.status(404).json({ message: 'Приют не найден' });
          return;
        }

        user = reqUser;
        shelterAdmin = await User.findById(shelter.admin);
        if (!shelterAdmin) {
          res.status(404).json({ message: 'Администратор приюта не найден' });
          return;
        }
      }

      let chat = await Chat.findOne({
        type: 'user-shelter',
        user: user._id,
        shelterAdmin: shelterAdmin._id
      }).populate('messages.sender', 'name');

      if (!chat) {
        chat = await Chat.create({
          type: 'user-shelter',
          user: user._id,
          shelter: shelter._id,
          shelterAdmin: shelterAdmin._id,
          messages: []
        });
      }

      res.json(chat);
      return;
    }

    if (chatType === 'user-user') {
      const { opponentId } = req.body;
      if (!opponentId) {
        res.status(400).json({ message: 'opponentId обязателен для чата user-user' });
        return;
      }

      const opponentUser = await User.findById(opponentId);
      if (!opponentUser) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }

      let chat = await Chat.findOne({
        type: 'user-user',
        $or: [
          { user1: reqUser._id, user2: opponentUser._id },
          { user1: opponentUser._id, user2: reqUser._id }
        ]
      }).populate('messages.sender', 'name');

      if (!chat) {
        chat = await Chat.create({
          type: 'user-user',
          user1: reqUser._id,
          user2: opponentUser._id,
          messages: []
        });
      }

      res.json(chat);
      return;
    }

    res.status(400).json({ message: 'Неверный тип чата' });
  } catch (error) {
    console.error('Ошибка при создании чата:', error);
    res.status(500).json({ message: 'Ошибка при создании чата', error });
  }
};

// Получить все чаты пользователя
export const getUserChats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'Пользователь не найден' });
      return;
    }

    const chats = await Chat.find({
      $or: [
        { user: userId },             // user-shelter
        { shelterAdmin: userId },     // user-shelter
        { user1: userId },            // user-user
        { user2: userId }             // user-user
      ]
    })
      .populate('user', 'name')
      .populate('shelterAdmin', 'name')
      .populate('user1', 'name')
      .populate('user2', 'name')
      .populate('shelter', 'name')
      .select('-messages');

    if (!chats || chats.length === 0) {
      res.status(404).json({ message: 'Чаты не найдены' });
      return;
    }

    res.json(chats);
  } catch (error) {
    console.error('Ошибка при получении чатов:', error);
    res.status(500).json({ message: 'Ошибка при получении чатов', error });
  }
};


// Получить все чаты приюта
export const getShelterChats = async (req: Request, res: Response): Promise<void> => {
    try {
        const shelter = await Shelter.findById(req.params.shelterId);
        if(!shelter){
            res.status(404).json({ message: 'Приют не найден' });
            return;
        }
        const chats = await Chat.find({ shelterAdmin: shelter.admin }).populate('user', 'name');
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении чатов', error });
    }
};

// Получить сообщения из конкретного чата
export const getChatMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const chat = await Chat.findById(req.params.chatId).populate('messages.sender', 'name');
        if (!chat) {
            res.status(404).json({ message: 'Чат не найден' });
            return;
        }
        res.json(chat.messages);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении сообщений', error });
    }
};

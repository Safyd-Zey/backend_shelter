import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { Shelter } from "../models/shelter";
import { LostFoundAnimal } from "../models/lostFoundAnimal";
import { Animal } from "../models/animal";
import { Chat } from "../models/chat";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

declare global {
  namespace Express {
    interface Request {
      user?: {
        name: any;
        email: any;
        city: any;
        phone: any;
        id: string;
        role: string;
        shelter?: string;
      };
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Нет доступа" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401).json({ message: "Пользователь не найден" });
      return;
    }

    // Кладем сюда весь user объект (включая city, email и т.д.)
    req.user = {
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Неверный токен" });
  }
};

// Проверка, что пользователь является автором
export const authorMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Неавторизованный пользователь" });
    return;
  }

  try {
    const post = await LostFoundAnimal.findById(req.params.id);

    if (!post) {
      res.status(404).json({ message: "Не можем найти данный пост" });
      return;
    }

    if (post.user.toString() !== req.user.id) {
      res
        .status(403)
        .json({ message: "Вы можете управлять только своим постом" });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Ошибка при проверке прав юзера", error });
  }
};

// Проверка, что пользователь является админом своего приюта
export const adminMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: "Неавторизованный пользователь" });
    return;
  }

  try {
    let shelter = await Shelter.findById(req.body.shelter || req.params.id);

    // Проверка на наличие приюта
    if (!shelter) {
      const animal = await Animal.findById(req.params.id);
      shelter = await Shelter.findById(animal?.shelter);
      if (!shelter) {
        res.status(404).json({ message: "Приют не найден" });
        return;
      }
    }

    // Проверка, что admin существует
    if (shelter.admin && shelter.admin.toString() !== req.user.id) {
      res
        .status(403)
        .json({ message: "Вы можете управлять только своим приютом" });
      return;
    }

    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при проверке прав администратора", error });
  }
};



// Проверка, что пользователь имеет доступ к чату
export const chatMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Неавторизованный пользователь' });
    return;
  }

  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      res.status(404).json({ message: 'Чат не найден' });
      return;
    }

    const userId = req.user.id;

    const hasAccess =
      (chat.type === 'user-shelter' &&
        (chat.user?.toString() === userId || chat.shelterAdmin?.toString() === userId)) ||
      (chat.type === 'user-user' &&
        (chat.user1?.toString() === userId || chat.user2?.toString() === userId));

    if (!hasAccess) {
      res.status(403).json({ message: 'Вы имеете доступ только к своим чатам' });
      return;
    }

    next();
  } catch (error) {
    console.error('Ошибка при проверке доступа к чату:', error);
    res.status(500).json({ message: 'Ошибка при проверке прав доступа', error });
  }
};

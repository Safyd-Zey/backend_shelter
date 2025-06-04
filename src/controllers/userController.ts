import { Request, Response } from "express";
import { User } from "../models/user";
import { Shelter } from "../models/shelter";
import { LostFoundAnimal } from "../models/lostFoundAnimal";
import { Animal } from "../models/animal";

// Получить всех пользователей (Только для админов)
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find().select("-password"); // Не отправляем пароли
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при получении списка пользователей", error });
  }
};

// Получить информацию о пользователе
export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }
    res.json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при получении пользователя", error });
  }
};

// Обновить данные пользователя
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");
    if (!updatedUser) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }
    if (req.params.id !== req.user?.id) {
      res.status(403).json("Вы можете управлять только своим аккаунтом");
      return;
    }
    res.json(updatedUser);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при обновлении пользователя", error });
  }
};

// Деактивизация пользователя
export const deactivateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { is_active } = req.body; // Получаем is_active из тела запроса

    // Проверяем, существует ли пользователь
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    let active: boolean;
    // Проверяем, передано ли значение is_active
    if (typeof is_active === "boolean") {
      active = is_active;
    } else {
      // Иначе инвертируем текущее значение is_active
      active = !user.is_active;
    }

    // Если пользователь деактивирован и он админ приюта
    if (!active && user.role === "shelterAdmin") {
      const shelter = await Shelter.findOne({ admin: user._id });
      if (shelter) {
        shelter.is_active = false;
        await shelter.save();

        // Деактивируем все связанные животные
        await Animal.updateMany({ shelter: shelter._id }, { is_active: false });
      }
    }

    // Деактивируем все объявления пользователя
    await LostFoundAnimal.updateMany({ user: user._id }, { is_active: false });

    // Обновляем статус пользователя
    user.is_active = active;
    await user.save();

    res.status(200).json({
      message: `Пользователь ${active ? "активирован" : "деактивирован"}`,
      user,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при деактивации пользователя", error });
  }
};

// Удалить пользователя (Только для админов)
export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }
    if (req.params.id !== req.user?.id) {
      res.status(403).json("Вы можете управлять только своим аккаунтом");
      return;
    }
    res.json({ message: "Пользователь удален" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при удалении пользователя", error });
  }
};
export const getCurrentUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Неавторизованный пользователь" });
      return;
    }

    const user = await User.findById(req.user.id)
    if(!user){
      res.status(401).json({ message: "Неавторизованный пользователь" });
      return;
    }
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      role: user.role,
      shelter: user.shelter,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при получении пользователя", error });
  }
};

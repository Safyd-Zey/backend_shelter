import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

const transporter = nodemailer.createTransport({
  service: "gmail", // или другой
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

// Регистрация
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, phone, city, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email уже зарегистрирован" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateCode();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      city,
      role,
      email_verification_code: verificationCode,
      email_verification_expires: new Date(Date.now() + 10 * 60 * 1000), // 10 минут
    });

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Код подтверждения регистрации",
      text: `Ваш код подтверждения: ${verificationCode}`,
    });

    res.status(201).json({
      message:
        "Пользователь зарегистрирован. Подтвердите email кодом, отправленным на почту.",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка регистрации", error });
  }
};

// Подтверждение аккаунта
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }
    if (user.is_verified) {
      res.status(400).json({ message: "Email уже подтверждён" });
      return;
    }

    if (
      !user.email_verification_expires ||
      user.email_verification_code !== code ||
      new Date() > new Date(user.email_verification_expires)
    ) {
      res.status(400).json({ message: "Неверный или просроченный код" });
      return;
    }

    user.is_verified = true;
    user.email_verification_code = undefined;
    user.email_verification_expires = undefined;
    await user.save();

    res.json({ message: "Email успешно подтверждён" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка подтверждения", error });
  }
};

export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    if (user.is_verified) {
      res.status(400).json({ message: "Email уже подтверждён" });
      return;
    }

    const newCode = generateCode();
    user.email_verification_code = newCode;
    user.email_verification_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 минут
    await user.save();

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: user.email,
      subject: "Новый код подтверждения",
      text: `Ваш новый код подтверждения: ${newCode}`,
    });

    res.json({ message: "Код отправлен повторно" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при повторной отправке кода", error });
  }
};

// Вход в систему
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    if (!user.is_verified) {
      res.status(403).json({ message: "Подтвердите email перед входом" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Неверный пароль" });
      return;
    }

    // Генерируем JWT-токен
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Ошибка входа", error });
  }
};
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      res.status(401).json({ message: "Неавторизованный пользователь" });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: "Пользователь не найден" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Текущий пароль неверный" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Пароль успешно изменён" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при смене пароля", error });
  }
};

import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import fs from 'fs';

// Загрузка фото в Cloudinary
export const uploadToCloudinary = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Файл не загружен' });
            return;
        }

        const result = await cloudinary.uploader.upload(req.file.path, { folder: 'animal_shelter' });

        // Удаляем файл после загрузки
        fs.unlinkSync(req.file.path);

        res.json({ imageUrl: result.secure_url });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при загрузке файла', error });
    }
};

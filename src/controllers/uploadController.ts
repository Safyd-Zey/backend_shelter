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

// Загрузка файла в Cloudinary
export const uploadToCloudinaryFile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Файл не загружен' });
            return;
        }


        // Определение папки
        const folderName ='animal_shelter/documents';

        // Явно указываем тип ресурса: image или raw
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: folderName,
            resource_type: 'raw',
            type: 'upload' // 🔑 это гарантирует, что файл будет доступен по URL без авторизации
        });

        // Удаляем файл после загрузки
        fs.unlinkSync(req.file.path);

        res.json({
            fileUrl: result.secure_url.replace('/image/upload/', `/${result.resource_type}/upload/`),
            resourceType: result.resource_type
        });

    } catch (error) {
        res.status(500).json({ message: 'Ошибка при загрузке файла', error });
    }
};

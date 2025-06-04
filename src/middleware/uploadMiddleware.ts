import multer from 'multer';
import path from 'path';

// Настройки хранения файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Сохраняем в папку uploads/
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${file.fieldname}${ext}`);
    }
});

// Фильтр файлов (только изображения)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Разрешены только изображения'), false);
    }
};

// Middleware для загрузки фото
export const upload = multer({ storage, fileFilter });

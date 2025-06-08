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

// Разрешённые типы MIME
const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Разрешены только изображения и документы (PDF, DOCX и др.)'), false);
    }
};



// Middleware для загрузки фото
export const upload = multer({ storage, fileFilter });

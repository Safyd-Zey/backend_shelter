import express from 'express';
import { upload } from '../middleware/uploadMiddleware';
import { uploadToCloudinary } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/cloudinary', authMiddleware, upload.single('file'), uploadToCloudinary);

export default router;

import express from 'express';
import { createAnimal, getAllAnimals, getAnimalById, updateAnimal, deleteAnimal, getAnimalQRCode, deactivateAnimal } from '../controllers/animalController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, createAnimal);
router.get('/', getAllAnimals);
router.get('/:id', getAnimalById);
router.put('/:id', authMiddleware, adminMiddleware, updateAnimal);
router.delete('/:id', authMiddleware, adminMiddleware, deleteAnimal);
router.get('/:id/qrcode', getAnimalQRCode);
router.patch('/:id', authMiddleware, adminMiddleware, deactivateAnimal) // Деактивизация объявления

export default router;

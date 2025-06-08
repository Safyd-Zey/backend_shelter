import express from 'express';
import { createAnimal, getAllAnimals, getAnimalById, updateAnimal, deleteAnimal, getAnimalQRCode, deactivateAnimal, addAnimalDocument, removeAnimalDocument} from '../controllers/animalController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, adminMiddleware, createAnimal);
router.get('/', getAllAnimals);
router.get('/:id', getAnimalById);
router.put('/:id', authMiddleware, adminMiddleware, updateAnimal);
router.patch('/:id/add-document', authMiddleware, adminMiddleware, addAnimalDocument);
router.patch('/:id/remove-document', authMiddleware, adminMiddleware, removeAnimalDocument);
router.delete('/:id', authMiddleware, adminMiddleware, deleteAnimal);
router.get('/:id/qrcode', getAnimalQRCode);
router.patch('/:id', authMiddleware, adminMiddleware, deactivateAnimal) // Деактивизация объявления

export default router;

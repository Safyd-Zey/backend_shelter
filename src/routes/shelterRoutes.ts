import express from 'express';
import { createShelter, getAllShelters, getShelterById, updateShelter, deleteShelter, getShelterAnimals, deactivateShelter } from '../controllers/shelterController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createShelter);
router.get('/', getAllShelters);
router.get('/:id', getShelterById);
router.get('/:id/animals', getShelterAnimals);
router.put('/:id', authMiddleware, adminMiddleware, updateShelter);
router.delete('/:id', authMiddleware, adminMiddleware, deleteShelter);
router.patch('/:id', authMiddleware, adminMiddleware, deactivateShelter) // Деактивизация объявления

export default router;

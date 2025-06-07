import express from 'express';
import {
  createAnimalType,
  getAllAnimalTypes,
  getAnimalTypeById,
  updateAnimalType,
  deleteAnimalType,
  deactivateAnimalType,
  createAnimalBreed,
  getBreedsByAnimalTypeId,
  deleteBreed
} from '../controllers/animalTypeController';
import {  authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

//type
router.post('/', authMiddleware, createAnimalType);
router.get('/', authMiddleware, getAllAnimalTypes);
router.get('/:id',authMiddleware, getAnimalTypeById); 
router.put('/:id', authMiddleware, updateAnimalType);
router.delete('/:id', authMiddleware, deleteAnimalType);
router.patch('/:id', authMiddleware,  deactivateAnimalType) // Деактивизация

// breed
router.post('/:id/breed', authMiddleware, createAnimalBreed); //Добавить породу для типа
router.get('/:id/breed',authMiddleware, getBreedsByAnimalTypeId); // Возвращает все возможные породы по :id типa животного 
router.delete('/:id/breed', authMiddleware, deleteBreed);

export default router;

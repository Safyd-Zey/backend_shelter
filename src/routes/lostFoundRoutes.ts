import express from 'express';
import { createLostFoundAnimal, getAllLostFoundAnimals, getLostAnimals, getFoundAnimals, putLostFoundAnimal, deleteLostFoundAnimal, deactivateLostFoundAnimal, getLostFoundAnimalsById } from '../controllers/lostFoundController';
import { authMiddleware, authorMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', authMiddleware, createLostFoundAnimal); // Создать объявление
router.get('/', getAllLostFoundAnimals); // Получить ВСЕ объявления
router.get('/get_one/:id', getLostFoundAnimalsById) // Получить одно объявление
router.get('/lost', getLostAnimals); // Получить только ПОТЕРЯННЫХ животных
router.get('/found', getFoundAnimals); // Получить только НАЙДЕННЫХ животных
router.put('/:id', authMiddleware, authorMiddleware, putLostFoundAnimal);
router.patch('/:id', authMiddleware, authorMiddleware, deactivateLostFoundAnimal) // Деактивизация объявления
router.delete('/:id', authMiddleware, authorMiddleware, deleteLostFoundAnimal); // Удалить объявление (только автор/админ)

export default router;

import { Request, Response } from 'express';
import { LostFoundAnimal } from '../models/lostFoundAnimal';

// Создать объявление (потерянное/найденное животное)
export const createLostFoundAnimal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, city, photo, description, location, latitude, longitude } = req.body;

        if (!type || !description || !location || !latitude || !longitude) {
            res.status(400).json({ message: 'Заполните все обязательные поля' });
            return;
        }

        const lostFoundAnimal = await LostFoundAnimal.create({
            type,
            city,
            photo,
            description,
            location,
            latitude,
            longitude,
            user: req.user?.id // Получаем ID текущего пользователя
        });

        res.status(201).json(lostFoundAnimal);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при создании объявления', error });
    }
};

export const getLostFoundAnimalsById = async (req: Request, res: Response): Promise<void> => {
    try{
        const lostFoundAnimal = await LostFoundAnimal.findById(req.params.id);
        res.json(lostFoundAnimal);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении потерянного животного', error });
    }
};

// Получить список всех объявлений
export const getAllLostFoundAnimals = async (req: Request, res: Response): Promise<void> => {
    try {
        const lostFoundAnimals = await LostFoundAnimal.find({is_active: true}).populate('user', 'name phone');
        res.json(lostFoundAnimals);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении списка объявлений', error });
    }
};

// Получить ТОЛЬКО потерянных животных
export const getLostAnimals = async (req: Request, res: Response): Promise<void> => {
    try {
        const lostAnimals = await LostFoundAnimal.find({ type: 'lost'  ,  is_active: true }).populate('user', 'name phone');
        res.json(lostAnimals);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении потерянных животных', error });
    }
};

// Получить ТОЛЬКО найденных животных
export const getFoundAnimals = async (req: Request, res: Response): Promise<void> => {
    try {
        const foundAnimals = await LostFoundAnimal.find({ type: 'found' ,  is_active: true }).populate('user', 'name phone');
        res.json(foundAnimals);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении найденных животных', error });
    }
};

// Изменение объявления
export const putLostFoundAnimal = async (req: Request, res: Response): Promise<void> => {
    try{
        const lostFoundAnimal = await LostFoundAnimal.findByIdAndUpdate(req.params.id);
        if (!lostFoundAnimal) {
            res.status(404).json({ message: 'Объявление не найдено' });
            return;
        }

        if (req.user?.role !== 'admin' && req.user?.id !== lostFoundAnimal.user.toString()) {
            res.status(403).json({ message: 'Вы можете удалить только свое объявление' });
            return;
        }

        const updatedLostFoundAnimal = await LostFoundAnimal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true } // Возвращает обновленный документ и проверяет валидацию
        );

        res.json({ message: 'Объявление изменено' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при изменении объявления', error });
    }
};

// Деактивизация объявления
export const deactivateLostFoundAnimal = async (req: Request, res: Response): Promise<void> => {
    try {
        // Получаем ID объявления из параметров и is_active из тела запроса
        const animalId = req.params.id;
        const { is_active } = req.body;

        // Проверяем, существует ли объявление
        const animal = await LostFoundAnimal.findById(animalId);
        if (!animal) {
            res.status(404).json({ message: 'Объявление не найдено' });
            return;
        }

        let active: boolean;

        // Проверяем, передано ли значение is_active
        if (typeof is_active === 'boolean') {
            // Если передано явно, устанавливаем его
            active = is_active;
        } else {
            // Иначе инвертируем текущее значение is_active
            active = !animal.is_active;
        }

        // Обновляем is_active объявления
        animal.is_active = active;
        await animal.save();

        res.status(200).json({
            message: `Объявление ${active ? 'активировано' : 'деактивировано'}`,
            animal,
        });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при деактивации объявления', error });
    }
};

// Удалить объявление (только автор или админ)
export const deleteLostFoundAnimal = async (req: Request, res: Response): Promise<void> => {
    try {
        const lostFoundAnimal = await LostFoundAnimal.findById(req.params.id);
        if (!lostFoundAnimal) {
            res.status(404).json({ message: 'Объявление не найдено' });
            return;
        }

        if (req.user?.role !== 'admin' && req.user?.id !== lostFoundAnimal.user.toString()) {
            res.status(403).json({ message: 'Вы можете удалить только свое объявление' });
            return;
        }

        await lostFoundAnimal.deleteOne();
        res.json({ message: 'Объявление удалено' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении объявления', error });
    }
};

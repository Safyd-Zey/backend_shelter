import { Request, Response } from 'express';
import { Animal } from '../models/animal';
import { Shelter } from '../models/shelter';
import QRCode from 'qrcode';

// Создать новое животное с QR-кодом
export const createAnimal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { type, name, age, breed, description, photo, shelter, color, health, weight, gender } = req.body;

        // Проверяем, существует ли приют, если указан
        if (shelter) {
            const existingShelter = await Shelter.findById(shelter);
            if (!existingShelter) {
                res.status(400).json({ message: 'Указанный приют не существует' });
                return;
            }
        }

        // Создаем запись о животном
        const animal = await Animal.create({ type, name, age, breed, description, photo, shelter, color, health, weight, gender });

        // Генерируем QR-код с ссылкой на страницу животного
        const animalPageUrl = `http://localhost:5000/api/animals/${animal._id}`;
        const qrCodeImage = await QRCode.toDataURL(animalPageUrl);

        // Добавляем QR-код в базу данных
        animal.qrCode = qrCodeImage;
        await animal.save();

        res.status(201).json(animal);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при создании животного', error });
    }
};

// Получить QR-код конкретного животного
export const getAnimalQRCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const animal = await Animal.findById(req.params.id);
        if (!animal || !animal.qrCode) {
            res.status(404).json({ message: 'QR-код не найден' });
            return;
        }
        res.json({ qrCode: animal.qrCode });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении QR-кода', error });
    }
};


// Фильтрация и получение списка животных
export const getAllAnimals = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, age, breed, shelter, adopted, color, weight, gender, city } = req.query;

        // Формируем объект фильтрации для Animal
        const filters: any = { is_active: true }; 

        if (name) filters.name = { $regex: new RegExp(name as string, 'i') };
        if (age) filters.age = Number(age);
        if (breed) filters.breed = { $regex: new RegExp(breed as string, 'i') };
        if (shelter) filters.shelter = shelter;
        if (adopted !== undefined) filters.adopted = adopted === 'true';
        if (color) filters.color = { $regex: new RegExp(color as string, 'i') };
        if (weight) filters.weight = Number(weight);
        if (gender) filters.gender = { $regex: new RegExp(gender as string, 'i') };

        // Выполняем поиск животных с привязкой к приютам
        const animals = await Animal.find(filters).populate({
            path: 'shelter',
            match: city ? { city: { $regex: new RegExp(city as string, 'i') } } : undefined
        });

        // Если указан город, фильтруем только тех животных, у которых shelter не null
        const filteredAnimals = city ? animals.filter(animal => animal.shelter !== null) : animals;

        res.json(filteredAnimals);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении списка животных', error });
    }
};




// Получить одно животное по ID
export const getAnimalById = async (req: Request, res: Response): Promise<void> => {
    try {
        const animal = await Animal.findById(req.params.id).populate('shelter');
        if (!animal) {
            res.status(404).json({ message: 'Животное не найдено' });
            return;
        }
        res.json(animal);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении животного', error });
    }
};

// Обновить данные животного
export const updateAnimal = async (req: Request, res: Response): Promise<void> => {
    try {
        const updatedAnimal = await Animal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedAnimal) {
            res.status(404).json({ message: 'Животное не найдено' });
            return;
        }
        res.json(updatedAnimal);
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при обновлении животного', error });
    }
};

// Деактивизация объявления
export const deactivateAnimal = async (req: Request, res: Response): Promise<void> => {
    try {
        const { is_active } = req.body; // Получаем is_active из тела запроса

        // Проверяем, существует ли животное
        const animal = await Animal.findById(req.params.id);
        if (!animal) {
            res.status(404).json({ message: 'Объявление не найдено' });
            return;
        }

        let active: boolean;
        // Проверяем, передано ли значение is_active
        if (typeof is_active === 'boolean') {
            active = is_active;
        } else {
            // Иначе инвертируем текущее значение is_active
            active = !animal.is_active;
        }

        // Обновляем статус животного
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


// Удалить животное
export const deleteAnimal = async (req: Request, res: Response): Promise<void> => {
    try {
        const deletedAnimal = await Animal.findByIdAndDelete(req.params.id);
        if (!deletedAnimal) {
            res.status(404).json({ message: 'Животное не найдено' });
            return;
        }
        res.json({ message: 'Животное удалено' });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении животного', error });
    }
};

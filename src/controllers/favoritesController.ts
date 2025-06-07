import { Request, Response } from 'express';
import { User } from '../models/user';
import { Animal } from '../models/animal';

// Добавить животное в избранное
export const addToFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id; // ID пользователя
        const { animalId } = req.body; // ID животного

       
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }
        try{
        const animal = await Animal.findById(animalId);
        if (!animal) {
            res.status(404).json({ message: 'Животное не найдено' });
            return;
        }

        if (!user.favorites.includes(animalId)) {
            user.favorites.push(animalId);
            await user.save();
        }
        }catch{
            res.status(500).json({ message: 'Животное не найдено' });
            return;
        }
        

        res.json({ message: 'Животное добавлено в избранное', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при добавлении в избранное', error });
    }
};

// Удалить животное из избранного
export const removeFromFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { animalId } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }

        const isFavorite = await user.favorites.includes(animalId);
        if (!isFavorite) {
            res.status(400).json({ message: 'Животное отсутствует в избранном' });
            return;
        }

        user.favorites = user.favorites.filter(id => id.toString() !== animalId);
        await user.save();

        res.json({ message: 'Животное удалено из избранного', favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при удалении из избранного', error });
    }
};

// Получить список избранных животных пользователя
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        const user = await User.findById(userId).populate('favorites');
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }

        res.json({ favorites: user.favorites });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка при получении избранного', error });
    }
};

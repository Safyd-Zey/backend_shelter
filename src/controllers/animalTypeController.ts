import { Request, Response } from 'express';
import { AnimalType } from '../models/animalType';

// --- TYPE handlers ---

export const createAnimalType = async (req: Request, res: Response) => {
  try {
    const { type, breeds } = req.body;

    const existing = await AnimalType.findOne({ type });
    if (existing) {
       res.status(400).json({ message: 'Такой тип уже существует' });
       return
    }

    const newType = new AnimalType({
      type,
      breeds: Array.isArray(breeds) ? breeds : [],
    });

    await newType.save();
    res.status(201).json(newType);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};


export const getAllAnimalTypes = async (req: Request, res: Response) => {
  try {
    const types = await AnimalType.find();
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const getAnimalTypeById = async (req: Request, res: Response) => {
  try {
    const type = await AnimalType.findById(req.params.id);
    if (!type) {
        res.status(404).json({ message: 'Тип не найден' });
        return;
    }
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const updateAnimalType = async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    const updated = await AnimalType.findByIdAndUpdate(
      req.params.id,
      { type },
      { new: true }
    );
    if (!updated) {
        res.status(404).json({ message: 'Тип не найден' });
        return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const deleteAnimalType = async (req: Request, res: Response) => {
  try {
    const deleted = await AnimalType.findByIdAndDelete(req.params.id);
    if (!deleted) {
        res.status(404).json({ message: 'Тип не найден' }); 
        return
    } 
    res.json({ message: 'Тип удалён' });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const deactivateAnimalType = async (req: Request, res: Response) => {
  try {
    const updated = await AnimalType.findByIdAndUpdate(
      req.params.id,
      { is_active: false },
      { new: true }
    );
    if (!updated)  {
        res.status(404).json({ message: 'Тип не найден' });
        return;
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

// --- BREED handlers ---

export const createAnimalBreed = async (req: Request, res: Response) => {
  try {
    const { breed } = req.body;
    const type = await AnimalType.findById(req.params.id);
    if (!type) {
        res.status(404).json({ message: 'Тип не найден' });
        return;
    }
    if (type.breeds.includes(breed)) {
       res.status(400).json({ message: 'Такая порода уже есть' });
       return;
    }

    type.breeds.push(breed);
    await type.save();
    res.status(200).json(type);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const getBreedsByAnimalTypeId = async (req: Request, res: Response) => {
  try {
    const type = await AnimalType.findById(req.params.id);
    if (!type)  {
        res.status(404).json({ message: 'Тип не найден' });
        return;
    }    
    res.json(type.breeds);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

export const deleteBreed = async (req: Request, res: Response) => {
  try {
    const { breed } = req.body;
    const type = await AnimalType.findById(req.params.id);
    if (!type)  {
        res.status(404).json({ message: 'Тип не найден' });
        return;
    }
    type.breeds = type.breeds.filter(b => b !== breed);
    await type.save();
    res.json({ message: 'Порода удалена', breeds: type.breeds });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

import { Request, Response } from "express";
import { Shelter } from "../models/shelter";
import { Animal } from "../models/animal";
import { User } from "../models/user";

// Создать новый приют
export const createShelter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      city,
      location,
      phone,
      email,
      description,
      photo,
      donations,
      latitude,
      longitude,
    } = req.body;

    if (!latitude || !longitude) {
      res.status(400).json({ message: "Координаты обязательны" });
      return;
    }

    const shelter = await Shelter.create({
      admin: req.user?.id, // Безопасный доступ к id
      name,
      city,
      location,
      phone,
      email,
      description,
      photo,
      donations,
      latitude,
      longitude,
    });

    await User.findByIdAndUpdate(
      req.user?.id,
      { 
        role: "shelterAdmin", 
        shelter: shelter._id 
      },
      { new: true }
    );


    res.status(201).json(shelter);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при создании приюта", error });
  }
};

// Получить все приюты с координатами
export const getAllShelters = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, city } = req.query;

    const filters: any = { is_active: true };

    if (name) filters.name = { $regex: new RegExp(name as string, "i") };
    if (city) filters.location = { $regex: new RegExp(city as string, "i") };

    const shelters = await Shelter.find(filters);
    res.json(shelters);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при получении списка приютов", error });
  }
};

// Обновить приют (с обновлением координат)
export const updateShelter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const updatedShelter = await Shelter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedShelter) {
      res.status(404).json({ message: "Приют не найден" });
      return;
    }
    res.json(updatedShelter);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении приюта", error });
  }
};

// Получить один приют по ID
export const getShelterById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      res.status(404).json({ message: "Приют не найден" });
      return;
    }
    res.json(shelter);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении приюта", error });
  }
};

// Получить один приют по ID
export const getShelterAnimals = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      res.status(404).json({ message: "Приют не найден" });
      return;
    }
    const shelterAnimals = await Animal.find({ shelter: shelter });
    res.json(shelterAnimals);
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении приюта", error });
  }
};

// Деактивизация приюта
export const deactivateShelter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { is_active } = req.body; // Получаем is_active из тела запроса

    // Проверяем, существует ли приют
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      res.status(404).json({ message: "Приют не найден" });
      return;
    }

    let active: boolean;
    // Проверяем, передано ли значение is_active
    if (typeof is_active === "boolean") {
      active = is_active;
    } else {
      // Иначе инвертируем текущее значение is_active
      active = !shelter.is_active;
    }

    // Обновляем статус приюта
    shelter.is_active = active;
    await shelter.save();

    let userRole = 'user';
    // Деактивируем все связанные животные, если приют деактивирован
    if (!active) {
      await Animal.updateMany({ shelter: shelter._id }, { is_active: false });
    }else{
      userRole = 'shelterAdmin'
    }

    await User.findByIdAndUpdate(
      shelter.admin,
      { 
        role: userRole
      },
      { new: true }
    );

    res.status(200).json({
      message: `Приют ${active ? "активирован" : "деактивирован"}`,
      shelter,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при деактивации приюта", error });
  }
};

// Удалить приют
/* export const deleteShelter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const deletedShelter = await Shelter.findByIdAndDelete(req.params.id);
    if (!deletedShelter) {
      res.status(404).json({ message: "Приют не найден" });
      return;
    }
    res.json({ message: "Приют удален" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении приюта", error });
  }
}; */
export const deleteShelter = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) {
      res.status(404).json({ message: "Приют не найден" });
      return;
    }
    await User.findByIdAndUpdate(
      shelter.admin,
      { 
        role: "user", 
        shelter: null
      },
      { new: true }
    );
    // Удаляем всех животных, связанных с этим приютом
    await Animal.deleteMany({ shelter: shelter._id });

    // Удаляем сам приют
    await Shelter.findByIdAndDelete(req.params.id);

    res.json({ message: "Приют и все его животные удалены" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении приюта", error });
  }
};

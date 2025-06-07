import mongoose from 'mongoose';

const LostFoundAnimalSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true }, // lost (потерян), found (найден)
  photo: { type: String, required: false }, // URL фото
  description: { type: String, required: true }, // Описание
  location: { type: String, required: true }, // Адрес
  latitude: { type: Number, required: true }, // Гео-координаты
  longitude: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // ID автора объявления
  createdAt: { type: Date, default: Date.now },
  city: { type: String },
  is_active: { type: Boolean, default: true },
});

export const LostFoundAnimal = mongoose.model('LostFoundAnimal', LostFoundAnimalSchema);

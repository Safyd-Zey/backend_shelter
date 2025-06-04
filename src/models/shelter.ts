import mongoose from 'mongoose';
import validator from 'validator';

const ShelterSchema = new mongoose.Schema({
  admin: {type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true},
  name: { type: String, required: true },
  city: { type: String},
  location: { type: String, required: true }, // Адрес в виде строки
  phone: { type: String, required: true },
  description: { type: String },
  photo: { type: String },
  donations: { type: String }, // Реквизиты для пожертвований
  latitude: { type: Number, required: true }, // Широта
  longitude: { type: Number, required: true }, // Долгота
  is_active: { type: Boolean, default: true },
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: 'Введите корректный email-адрес'
  }
  }
}, { timestamps: true });

export const Shelter = mongoose.model('Shelter', ShelterSchema);

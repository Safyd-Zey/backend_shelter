import mongoose from 'mongoose';

const AnimalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number },
  type: {type: String},
  health: {type: String, enum: ['healthy', 'needs care', 'sick']},
  breed: { type: String},
  description: { type: String },
  photo: { type: String },
  shelter: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' },
  adopted: { type: Boolean, default: false },
  qrCode: { type: String, required: false }, // QR-код в формате Base64
  color: { type: String },
  weight: { type: Number },
  gender: { type: String, enum: ['male', 'female'] },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

export const Animal = mongoose.model('Animal', AnimalSchema);

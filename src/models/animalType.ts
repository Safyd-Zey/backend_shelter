import mongoose from 'mongoose';

const AnimalTypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  breeds: { type: [String], default: [] },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

export const AnimalType = mongoose.model('AnimalType', AnimalTypeSchema);

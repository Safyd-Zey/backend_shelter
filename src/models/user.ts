import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  city: { type: String },
  role: { type: String, enum: ['user', 'admin', 'shelterAdmin'], default: 'user' }, // Роли пользователей
  shelter: {type: mongoose.Schema.Types.ObjectId, ref: 'Shelter', unique: true},
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Animal' }],
  is_active: { type: Boolean, default: true },
  is_verified: { type: Boolean, default: false },
  email_verification_code: { type: String },
  email_verification_expires: { type: Date },
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);

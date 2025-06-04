import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  type: { type: String, enum: ['user-shelter', 'user-user'], required: true },

  // Для user-shelter
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shelter: { type: mongoose.Schema.Types.ObjectId, ref: 'Shelter' },
  shelterAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Для user-user
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

export const Chat = mongoose.model('Chat', ChatSchema);

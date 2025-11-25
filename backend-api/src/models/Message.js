const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    trim: true
  },
  media: {
    type: String
  },
  mediaType: {
    type: String,
    enum: ['image', 'video'],
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true // ✅ Add index for faster queries
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index untuk query yang lebih cepat
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
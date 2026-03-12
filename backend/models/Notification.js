/**
 * Notification Model
 * Stores skill match and connection notifications
 */
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Notification message text
  message: {
    type: String,
    required: true
  },
  // Type of notification: 'skill_match', 'like', 'comment', 'connection'
  type: {
    type: String,
    enum: ['skill_match', 'like', 'comment', 'connection'],
    default: 'skill_match'
  },
  // Related user (e.g., user who shares skills)
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Related post (if applicable)
  relatedPost: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  // Whether notification has been read
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for fetching user notifications efficiently
notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

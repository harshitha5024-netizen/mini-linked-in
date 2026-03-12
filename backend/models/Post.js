/**
 * Post Model
 * Defines the schema for posts in the Mini LinkedIn feed
 */
const mongoose = require('mongoose');

// Comment sub-schema
const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

const postSchema = new mongoose.Schema({
  // Reference to the post author
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Post content
  caption: {
    type: String,
    required: true,
    maxlength: 3000
  },
  // Optional image URL from Cloudinary
  imageUrl: {
    type: String,
    default: ''
  },
  // Skills detected in the caption by the system
  skillsDetected: [{
    type: String,
    trim: true
  }],
  // Array of user IDs who liked the post
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Comments on the post
  comments: [commentSchema]
}, {
  timestamps: true
});

// Index for sorting by newest first
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);

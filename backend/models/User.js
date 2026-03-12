/**
 * User Model
 * Defines the schema for user profiles in the Mini LinkedIn application
 */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Firebase UID for authentication linkage
  firebaseUID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  // Profile Details
  profileImage: {
    type: String,
    default: '' // URL from Cloudinary
  },
  // Professional Details
  headline: {
    type: String,
    default: '',
    maxlength: 200
  },
  currentCompany: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: '',
    maxlength: 2000
  },
  // Skills array for matching
  skills: [{
    type: String,
    trim: true
  }],
  // Location info
  location: {
    type: String,
    default: ''
  },
  // Professional background
  experience: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  // Connections
  connections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for skill-based searching
userSchema.index({ skills: 1 });

module.exports = mongoose.model('User', userSchema);

/**
 * Company Model
 * Defines the schema for company profiles on Mini LinkedIn
 */
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  employeeCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

companySchema.index({ name: 'text' });

module.exports = mongoose.model('Company', companySchema);

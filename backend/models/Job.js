/**
 * Job Model
 * Defines the schema for job postings in Mini LinkedIn
 */
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  posterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  salary: {
    type: String,
    default: 'Competitive'
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    default: 'Full-time'
  }
}, {
  timestamps: true
});

jobSchema.index({ createdAt: -1 });
jobSchema.index({ companyName: 'text', title: 'text' });

module.exports = mongoose.model('Job', jobSchema);

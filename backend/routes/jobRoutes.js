/**
 * Job Routes
 * API endpoints for job postings and retrieval
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createJob,
  getAllJobs,
  getJobById
} = require('../controllers/jobController');

// All routes require authentication
router.use(authMiddleware);

// POST /api/jobs - Create a new job listing
router.post('/', createJob);

// GET /api/jobs - Get all job listings
router.get('/', getAllJobs);

// GET /api/jobs/:id - Get a specific job detail
router.get('/:id', getJobById);

module.exports = router;

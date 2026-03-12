/**
 * Company Routes
 * API endpoints for company management
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getAllCompanies,
  createCompany,
  toggleFollowCompany
} = require('../controllers/companyController');

// All routes require authentication
router.use(authMiddleware);

// GET /api/companies - Get all companies
router.get('/', getAllCompanies);

// POST /api/companies - Create a new company
router.post('/', createCompany);

// POST /api/companies/:id/follow - Follow/Unfollow a company
router.post('/:id/follow', toggleFollowCompany);

module.exports = router;

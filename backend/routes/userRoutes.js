/**
 * User Routes
 * API endpoints for user management and profiles
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { upload } = require('../../config/cloudinary');
const {
  createUser,
  getUser,
  getCurrentUser,
  updateUser,
  getAllUsers,
  getSuggestions,
  connectUser,
  getConnections
} = require('../controllers/userController');

// All routes require authentication
router.use(authMiddleware);

// POST /api/users - Create a new user profile
router.post('/', createUser);

// GET /api/users/me - Get current user's profile
router.get('/me', getCurrentUser);

// GET /api/users/me/connections - Get current user's connections
router.get('/me/connections', getConnections);

// POST /api/users/:id/connect - Connect/Unconnect with a user
router.post('/:id/connect', connectUser);

// GET /api/users - Get all users
router.get('/', getAllUsers);

// GET /api/users/:id - Get a specific user's profile
router.get('/:id', getUser);

// PUT /api/users/:id - Update user profile (with optional image upload)
router.put('/:id', upload.single('profileImage'), updateUser);

// GET /api/users/:id/suggestions - Get skill-based connection suggestions
router.get('/:id/suggestions', getSuggestions);

module.exports = router;

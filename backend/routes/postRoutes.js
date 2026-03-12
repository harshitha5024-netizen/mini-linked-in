/**
 * Post Routes
 * API endpoints for post management, likes, and comments
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { upload } = require('../../config/cloudinary');
const {
  createPost,
  getPosts,
  toggleLike,
  addComment
} = require('../controllers/postController');

// All routes require authentication
router.use(authMiddleware);

// POST /api/posts - Create a new post (with optional image upload)
router.post('/', upload.single('image'), createPost);

// GET /api/posts - Get all posts (feed)
router.get('/', getPosts);

// POST /api/posts/:id/like - Like or unlike a post
router.post('/:id/like', toggleLike);

// POST /api/posts/:id/comment - Add a comment to a post
router.post('/:id/comment', addComment);

module.exports = router;

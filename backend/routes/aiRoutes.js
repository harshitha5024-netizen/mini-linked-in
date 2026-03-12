/**
 * AI Routes
 * API endpoints for AI-powered features using Groq API
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { enhanceBio, enhanceCaption } = require('../controllers/aiController');

// All routes require authentication
router.use(authMiddleware);

// POST /api/ai/enhance-bio - Enhance user bio with AI
router.post('/enhance-bio', enhanceBio);

// POST /api/ai/enhance-caption - Enhance post caption with AI
router.post('/enhance-caption', enhanceCaption);

module.exports = router;

/**
 * Notification Routes
 * API endpoints for notification management
 */
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getNotifications, markAllRead } = require('../controllers/notificationController');

// All routes require authentication
router.use(authMiddleware);

// GET /api/notifications - Get user notifications
router.get('/', getNotifications);

// PUT /api/notifications/read - Mark all notifications as read
router.put('/read', markAllRead);

module.exports = router;

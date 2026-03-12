/**
 * Notification Controller
 * Handles fetching and managing user notifications
 */
const Notification = require('../models/Notification');

/**
 * Get all notifications for the current user
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const notifications = await Notification.find({ userId: req.user._id })
      .populate('relatedUser', 'name profileImage headline')
      .sort({ createdAt: -1 })
      .limit(50);

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

/**
 * Mark all notifications as read
 * PUT /api/notifications/read
 */
const markAllRead = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
};

module.exports = {
  getNotifications,
  markAllRead
};

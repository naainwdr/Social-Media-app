const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
} = require('../controllers/notificationController');

// Get all notifications (protected)
router.get('/', protect, getNotifications);

// Get unread count (protected)
router.get('/unread/count', protect, getUnreadCount);

// Mark specific notification as read
router.patch('/:notificationId/read', protect, markAsRead);

// Mark all notifications as read
router.patch('/read/all', protect, markAllAsRead);

// Delete specific notification
router.delete('/:notificationId', protect, deleteNotification);

// Clear all notifications
router.delete('/clear/all', protect, clearAllNotifications);

module.exports = router;

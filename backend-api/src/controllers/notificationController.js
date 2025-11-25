const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { isRead, limit = 20, skip = 0 } = req.query;

        let query = { recipientId: userId };
        if (isRead !== undefined) {
            query.isRead = isRead === 'true';
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const totalCount = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            recipientId: userId,
            isRead: false
        });

        res.json({
            success: true,
            data: notifications,
            pagination: {
                total: totalCount,
                unread: unreadCount,
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        });
    } catch (error) {
        console.error('❌ Error getting notifications:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Get unread notifications count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const unreadCount = await Notification.countDocuments({
            recipientId: userId,
            isRead: false
        });

        res.json({
            success: true,
            unreadCount
        });
    } catch (error) {
        console.error('❌ Error getting unread count:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.userId;

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, recipientId: userId },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await Notification.updateMany(
            { recipientId: userId, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.userId;

        const notification = await Notification.findOneAndDelete({
            _id: notificationId,
            recipientId: userId
        });

        if (!notification) {
            return res.status(404).json({ success: false, error: 'Notification not found' });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('❌ Error deleting notification:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Clear all notifications
exports.clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;

        const result = await Notification.deleteMany({
            recipientId: userId
        });

        res.json({
            success: true,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('❌ Error clearing notifications:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// Create notification (Internal use)
exports.createNotification = async (recipientId, senderId, type, content, relatedId = null, relatedType = null) => {
    try {
        const notification = new Notification({
            recipientId,
            senderId,
            type,
            content,
            relatedId,
            relatedType
        });

        await notification.save();
        
        // Populate data
        await notification.populate({
            path: 'senderId',
            select: 'username avatar'
        }).populate({
            path: 'relatedId',
            select: 'content image title'
        });

        return notification;
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        return null;
    }
};

import api from './api';

// Get all notifications
export const getNotifications = async (isRead = null, limit = 20, skip = 0) => {
    try {
        const params = { limit, skip };
        if (isRead !== null) {
            params.isRead = isRead;
        }
        const response = await api.get('/notifications', { params });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get unread notifications count
export const getUnreadCount = async () => {
    try {
        const response = await api.get('/notifications/unread/count');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
    try {
        const response = await api.patch(`/notifications/${notificationId}/read`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
    try {
        const response = await api.patch('/notifications/read/all');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
    try {
        const response = await api.delete(`/notifications/${notificationId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Clear all notifications
export const clearAllNotifications = async () => {
    try {
        const response = await api.delete('/notifications/clear/all');
        return response.data;
    } catch (error) {
        throw error;
    }
};

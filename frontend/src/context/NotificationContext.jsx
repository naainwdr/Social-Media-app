import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { getNotifications, getUnreadCount } from '../services/notificationService';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const { socket } = useSocket();
    const { user, token } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch notifications dari API
    const fetchNotifications = useCallback(async (isRead = null) => {
        // Jangan fetch jika belum login
        if (!token || !user) {
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getNotifications(isRead);
            setNotifications(data.data || []);
            setUnreadCount(data.pagination?.unread || 0);
        } catch (err) {
            // Ignore 401 errors (not authenticated)
            if (err.status !== 401) {
                console.error('Error fetching notifications:', err);
                setError(err.error || 'Failed to fetch notifications');
            }
        } finally {
            setLoading(false);
        }
    }, [token, user]);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        // Jangan fetch jika belum login
        if (!token || !user) {
            setUnreadCount(0);
            return;
        }

        try {
            const data = await getUnreadCount();
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            // Ignore 401 errors (not authenticated)
            if (err.status !== 401) {
                console.error('Error fetching unread count:', err);
            }
        }
    }, [token, user]);

    // Initial load hanya saat user login
    useEffect(() => {
        if (!token || !user) {
            // Reset state jika logout
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // Fetch notifications pertama kali
        fetchNotifications();
        fetchUnreadCount();

        // Polling unread count setiap 30 detik
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, [token, user, fetchNotifications, fetchUnreadCount]);

    // Listen untuk real-time notifications dari Socket.IO
    useEffect(() => {
        if (!socket || !user) return;

        const handleReceiveNotification = (notification) => {
            console.log('📬 New notification received:', notification);
            setNotifications((prev) => [notification, ...prev]);
            setUnreadCount((prev) => prev + 1);
        };

        socket.on('receive-notification', handleReceiveNotification);

        return () => {
            socket.off('receive-notification', handleReceiveNotification);
        };
    }, [socket, user]);

    const value = {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        fetchUnreadCount,
        setNotifications,
        setUnreadCount
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

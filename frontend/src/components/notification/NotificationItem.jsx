import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Trash2, Check } from 'lucide-react';
import { markNotificationAsRead, deleteNotification } from '../../services/notificationService';
import toast from 'react-hot-toast';

export const NotificationItem = ({ notification, onRead, onDelete }) => {
    const handleMarkAsRead = async () => {
        try {
            await markNotificationAsRead(notification._id);
            onRead(notification._id);
        } catch (err) {
            toast.error('Gagal menandai notifikasi');
        }
    };

    const handleDelete = async () => {
        try {
            await deleteNotification(notification._id);
            onDelete(notification._id);
            toast.success('Notifikasi dihapus');
        } catch (err) {
            toast.error('Gagal menghapus notifikasi');
        }
    };

    const getNotificationIcon = () => {
        switch (notification.type) {
            case 'like':
                return '❤️';
            case 'comment':
                return '💬';
            case 'follow':
                return '👤';
            case 'message':
                return '💌';
            case 'story':
                return '📖';
            default:
                return '📢';
        }
    };

    const getNotificationMessage = () => {
        switch (notification.type) {
            case 'like':
                return `${notification.senderId?.username} menyukai postingan Anda`;
            case 'comment':
                return `${notification.senderId?.username} mengomentari postingan Anda`;
            case 'follow':
                return `${notification.senderId?.username} mulai mengikuti Anda`;
            case 'message':
                return `${notification.senderId?.username} mengirim pesan`;
            case 'story':
                return `${notification.senderId?.username} membagikan cerita baru`;
            default:
                return notification.content;
        }
    };

    const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: id
    });

    return (
        <div
            className={`flex items-start gap-3 p-4 hover:bg-dark-800/50 transition-colors group ${
                !notification.isRead ? 'bg-dark-800/30' : 'bg-dark-900/20'
            }`}
        >
            {/* Notification Icon */}
            <div className="text-2xl mt-0.5 flex-shrink-0">{getNotificationIcon()}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-100 break-words leading-snug">
                    {getNotificationMessage()}
                </p>
                <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.isRead && (
                    <button
                        onClick={handleMarkAsRead}
                        className="p-1.5 hover:bg-dark-700 rounded-full transition-colors"
                        title="Tandai sebagai dibaca"
                    >
                        <Check size={16} className="text-gray-400 hover:text-blue-400" />
                    </button>
                )}

                <button
                    onClick={handleDelete}
                    className="p-1.5 hover:bg-dark-700 rounded-full transition-colors"
                    title="Hapus"
                >
                    <Trash2 size={16} className="text-gray-400 hover:text-red-400" />
                </button>
            </div>

            {/* Unread indicator */}
            {!notification.isRead && (
                <div className="w-2 h-2 bg-gradient-instagram rounded-full flex-shrink-0 mt-1" />
            )}
        </div>
    );
};

import { useState } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { NotificationPanel } from './NotificationPanel';
import { Bell } from 'lucide-react';

export const NotificationBell = () => {
    const { unreadCount } = useNotification();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-dark-800 rounded-full transition-colors group"
                title="Notifications"
            >
                <Bell size={24} className="text-gray-400 group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-5 h-5 bg-gradient-instagram text-white text-xs font-bold rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <NotificationPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

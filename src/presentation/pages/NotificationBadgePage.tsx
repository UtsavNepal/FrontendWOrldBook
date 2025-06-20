import React, { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { profileRepository } from '../../infrastructure/repositories/ProfileRepository';

const NotificationBadgePage: React.FC = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const notifications = await profileRepository.getNotifications();
        const unread = notifications.filter((n: any) => n.is_read === false).length;
        setUnreadCount(unread);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span className="relative">
      <Heart size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-bold border border-white">
          {unreadCount}
        </span>
      )}
    </span>
  );
};

export default NotificationBadgePage; 
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileRepository } from '../../infrastructure/repositories/ProfileRepository';
import MainLayout from "../components/MainLayout";
import { MoreVertical } from "lucide-react";

interface NotificationsPageProps {
  onRead?: () => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onRead }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchNotifications = () => {
    setLoading(true);
    profileRepository.getNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleNotificationClick = async (notif: any) => {
    if (!notif.is_read) {
      await profileRepository.markNotificationRead(notif.id);
      fetchNotifications();
      if (onRead) onRead();
    }
    if (notif.related_post) {
      navigate(`/post/${notif.related_post.id}`);
    } else if (notif.actor) {
      navigate(`/profile/${notif.actor.id}`);
    }
  };

  const handleMarkAllAsRead = async () => {
    await profileRepository.markAllNotificationsRead();
    fetchNotifications();
    if (onRead) onRead();
  };

  const handleDelete = async (id: number) => {
    await profileRepository.deleteNotification(id);
    fetchNotifications();
    if (onRead) onRead();
  };

  const handleMarkReadUnread = async (notif: any) => {
    if (notif.is_read) {
      await profileRepository.markNotificationUnread(notif.id);
    } else {
      await profileRepository.markNotificationRead(notif.id);
    }
    fetchNotifications();
    if (onRead) onRead();
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuOpenId !== null) {
        setMenuOpenId(null);
        console.log(e);
      }
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpenId]);

  return (
    <MainLayout>
      <div className="flex justify-center items-start min-h-screen bg-gray-50">
        <div className="w-full max-w-xl p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8 mx-auto flex-1 h-full">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">Notifications</h2>
          <div className="flex justify-end mb-4">
            <button
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold shadow"
              onClick={handleMarkAllAsRead}
              disabled={notifications.every(n => n.is_read)}
            >
              Mark all as read
            </button>
          </div>
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No notifications</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`flex items-center gap-3 py-4 px-2 hover:bg-gray-50 cursor-pointer ${notif.is_read ? "opacity-70" : ""}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <img
                    src={notif.actor?.profile_picture ? (notif.actor.profile_picture.startsWith('http') ? notif.actor.profile_picture : `${import.meta.env.VITE_BACKEND_URL}${notif.actor.profile_picture}`) : "/default-avatar.png"}
                    alt={notif.actor?.username}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{notif.actor?.username}</span>
                    <span className="text-gray-700 dark:text-gray-300 ml-1">{notif.message.replace(notif.actor?.username, "")}</span>
                    <div className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleString()}</div>
                  </div>
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                      className="p-2 rounded-full hover:bg-gray-200"
                      onClick={() => setMenuOpenId(menuOpenId === notif.id ? null : notif.id)}
                    >
                      <MoreVertical size={20} />
                    </button>
                    {menuOpenId === notif.id && (
                      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-50">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => { handleMarkReadUnread(notif); setMenuOpenId(null); }}
                        >
                          {notif.is_read ? "Mark as unread" : "Mark as read"}
                        </button>
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
                          onClick={() => { handleDelete(notif.id); setMenuOpenId(null); }}
                        >
                          Delete notification
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default NotificationsPage;
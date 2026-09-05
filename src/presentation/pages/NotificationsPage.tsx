import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileRepository } from '../../infrastructure/repositories/ProfileRepository';
import MainLayout from "../components/MainLayout";
import PageShell from "../components/PageShell";
import { getImageUrl } from "../../utils/getImageUrl";
import { MoreVertical } from "lucide-react";

interface NotificationsPageProps {
  onRead?: () => void;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ onRead }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
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

  const handleDelete = async (id: string) => {
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
    const handleClick = () => {
      if (menuOpenId !== null) setMenuOpenId(null);
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpenId]);

  return (
    <MainLayout>
      <PageShell
        title="Notifications"
        action={
          <button
            className="wb-btn-secondary"
            onClick={handleMarkAllAsRead}
            disabled={notifications.length === 0 || notifications.every(n => n.is_read)}
          >
            Mark all as read
          </button>
        }
      >
        {loading ? (
          <div className="wb-empty">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="wb-empty">You're all caught up.</div>
        ) : (
          <ul className="wb-card overflow-hidden">
            {notifications.map((notif) => (
              <li
                key={notif.id}
                className={`flex cursor-pointer items-center gap-3 border-b border-wb-line px-4 py-3 last:border-b-0 hover:bg-wb-canvas ${notif.is_read ? "opacity-70" : "bg-blue-50/50"}`}
                onClick={() => handleNotificationClick(notif)}
              >
                <img
                  src={getImageUrl(notif.actor?.profile_picture)}
                  alt={notif.actor?.username}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{notif.actor?.username}</span>
                    <span className="text-wb-ink"> {notif.message.replace(notif.actor?.username, "")}</span>
                  </p>
                  <p className="mt-1 text-xs text-wb-muted">{new Date(notif.timestamp).toLocaleString()}</p>
                </div>
                {!notif.is_read && <span className="h-2.5 w-2.5 rounded-full bg-wb-blue" />}
                <div className="relative" onClick={e => e.stopPropagation()}>
                  <button
                    className="rounded-full p-2 hover:bg-white"
                    onClick={() => setMenuOpenId(menuOpenId === notif.id ? null : notif.id)}
                  >
                    <MoreVertical size={18} className="text-wb-muted" />
                  </button>
                  {menuOpenId === notif.id && (
                    <div className="absolute right-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-wb-line bg-white shadow-card">
                      <button
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-wb-canvas"
                        onClick={() => { handleMarkReadUnread(notif); setMenuOpenId(null); }}
                      >
                        {notif.is_read ? "Mark as unread" : "Mark as read"}
                      </button>
                      <button
                        className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-wb-canvas"
                        onClick={() => { handleDelete(notif.id); setMenuOpenId(null); }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </PageShell>
    </MainLayout>
  );
};

export default NotificationsPage;

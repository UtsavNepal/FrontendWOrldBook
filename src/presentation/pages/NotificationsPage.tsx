import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { profileRepository } from '../../infrastructure/repositories/ProfileRepository';
import MainLayout from "../components/MainLayout";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    profileRepository.getNotifications()
      .then(setNotifications)
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="flex justify-center items-start min-h-screen bg-gray-50">
        <div className="w-full max-w-xl p-4 bg-white rounded-lg shadow-md mt-8 mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Notifications</h2>
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
                  onClick={() => {
                    if (notif.related_post) {
                      navigate(`/post/${notif.related_post.id}`);
                    } else if (notif.actor) {
                      navigate(`/profile/${notif.actor.id}`);
                    }
                  }}
                >
                  <img
                    src={notif.actor?.profile_picture ? (notif.actor.profile_picture.startsWith('http') ? notif.actor.profile_picture : `${import.meta.env.VITE_BACKEND_URL}${notif.actor.profile_picture}`) : "/default-avatar.png"}
                    alt={notif.actor?.username}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800">{notif.actor?.username}</span>
                    <span className="text-gray-700 ml-1">{notif.message.replace(notif.actor?.username, "")}</span>
                    <div className="text-xs text-gray-400 mt-1">{new Date(notif.timestamp).toLocaleString()}</div>
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
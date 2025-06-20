import React from "react";
import { useNavigate } from "react-router-dom";

interface UserListProps {
  users: any[];
  title?: string;
  loading?: boolean;
}

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const UserList: React.FC<UserListProps> = ({ users, title, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {title && <h3 className="text-xl font-semibold mb-4 text-center text-gray-800 dark:text-gray-100">{title}</h3>}
      {loading ? (
        <div className="text-center text-gray-400 dark:text-gray-300 py-8">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center text-gray-400 dark:text-gray-300 py-8">No users found.</div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
            >
              <img
                src={user.profile_picture ? (user.profile_picture.startsWith('http') ? user.profile_picture : `${BACKEND_BASE_URL}${user.profile_picture}`) : "/default-avatar.png"}
                alt={user.username}
                className="w-14 h-14 rounded-full object-cover border border-gray-200 cursor-pointer"
                onClick={() => navigate(`/profile/${user.id}`)}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="font-semibold text-gray-800 dark:text-gray-100 text-lg truncate cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  {user.username}
                </div>
                {user.bio && <div className="text-gray-500 dark:text-gray-300 text-sm truncate">{user.bio}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList; 
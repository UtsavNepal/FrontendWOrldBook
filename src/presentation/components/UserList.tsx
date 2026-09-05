import React from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../../utils/getImageUrl";

interface UserListProps {
  users: any[];
  title?: string;
  loading?: boolean;
}

const UserList: React.FC<UserListProps> = ({ users, title, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      {title && <h3 className="mb-4 text-center text-xl font-semibold">{title}</h3>}
      {loading ? (
        <div className="wb-empty">Loading...</div>
      ) : users.length === 0 ? (
        <div className="wb-empty">No users found.</div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="wb-card flex cursor-pointer items-center gap-3 p-3 hover:bg-wb-canvas"
              onClick={() => navigate(`/profile/${user.id}`)}
            >
              <img
                src={getImageUrl(user.profile_picture)}
                alt={user.username}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{user.username}</p>
                {user.bio && <p className="truncate text-sm text-wb-muted">{user.bio}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;

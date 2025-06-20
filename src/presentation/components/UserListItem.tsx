import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../../utils/getImageUrl';

interface User {
  id: number;
  username?: string;
  profile_picture?: string;
  user?: {
    id: number;
  };
}

interface UserListItemProps {
  user: User;
  type: 'followers' | 'following' | 'friends';
  onUnfollow?: (userId: number) => void;
  onFollow?: (userId: number) => void;
  onUnfriend?: (userId: number) => void;
  authenticatedProfileId?: number;
}

const UserListItem: React.FC<UserListItemProps> = ({ user, type, onUnfollow, onFollow, onUnfriend, authenticatedProfileId }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);
  const [dropdownPositionClass, setDropdownPositionClass] = useState('top-full mt-2');
  
  const handleToggleDropdown = () => {
    if (!dropdownOpen && dropdownContainerRef.current) {
      const { bottom } = dropdownContainerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - bottom;
      if (spaceBelow < 150) { // 150px is a safe estimate for dropdown height
        setDropdownPositionClass('bottom-full mb-2');
      } else {
        setDropdownPositionClass('top-full mt-2');
      }
    }
    setDropdownOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const isSelf = authenticatedProfileId === user.id;
  const username = user.username || '';

  console.log('UserListItem', { userId: user.id, authenticatedProfileId });

  return (
    <li className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
      <div className="flex items-center gap-4">
        <img
          src={getImageUrl(user.profile_picture)}
          alt={username}
          className="w-14 h-14 rounded-full object-cover"
        />
        <span className="font-semibold text-lg">{username}</span>
      </div>
      {!isSelf && (
        <div className="relative" ref={dropdownContainerRef}>
          <button onClick={handleToggleDropdown} className="px-4 py-2 bg-gray-200 rounded-md flex items-center">
            View Profile <span className="ml-2">↓</span>
          </button>
          {dropdownOpen && (
            <div className={`absolute right-0 w-48 bg-white border rounded-lg shadow-lg z-10 ${dropdownPositionClass}`}>
              <Link to={`/profile/${user.id}`} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                View Profile
              </Link>
              {type === 'following' && onUnfollow && (
                <button
                  onClick={() => {
                    onUnfollow(user.id);
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                >
                  Unfollow
                </button>
              )}
              {type === 'followers' && onFollow && (
                <button
                  onClick={() => {
                    onFollow(user.id);
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Follow Back
                </button>
              )}
              {type === 'friends' && onUnfriend && (
                <button
                  onClick={() => {
                    onUnfriend(user.id);
                    setDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                >
                  Unfriend
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default UserListItem; 
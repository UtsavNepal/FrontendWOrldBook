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
      if (spaceBelow < 150) { 
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

  return (
    <li className="wb-card flex items-center justify-between p-3">
      <div className="flex items-center gap-3">
        <img
          src={getImageUrl(user.profile_picture)}
          alt={username}
          className="h-12 w-12 rounded-full object-cover"
        />
        <span className="font-semibold">{username}</span>
      </div>
      {!isSelf && (
        <div className="relative" ref={dropdownContainerRef}>
          <button onClick={handleToggleDropdown} className="wb-btn-secondary">
            View profile
          </button>
          {dropdownOpen && (
            <div className={`absolute right-0 z-10 w-44 overflow-hidden rounded-xl border border-wb-line bg-white shadow-card ${dropdownPositionClass}`}>
              <Link to={`/profile/${user.id}`} className="block w-full px-4 py-2 text-left text-sm hover:bg-wb-canvas">
                View profile
              </Link>
              {type === 'following' && onUnfollow && (
                <button
                  onClick={() => {
                    onUnfollow(user.id);
                    setDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-wb-canvas"
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
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-wb-canvas"
                >
                  Follow back
                </button>
              )}
              {type === 'friends' && onUnfriend && (
                <button
                  onClick={() => {
                    onUnfriend(user.id);
                    setDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-wb-canvas"
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
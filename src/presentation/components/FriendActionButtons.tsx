import React from 'react';
import { FriendRequest } from '../../core/domain/entities/Friend.entity';

interface User {
  id: number;
  username?: string;
  profile_picture?: string;
}

interface FriendActionButtonsProps {
  targetUser: User;
  currentUser: User;
  isFriend: boolean;
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onSend: (userId: number) => Promise<void>;
  onCancel: (requestId: number) => Promise<void>;
  onAccept: (requestId: number) => Promise<void>;
  onReject: (requestId: number) => Promise<void>;
  onUnfriend: (userId: number) => Promise<void>;
}

const FriendActionButtons: React.FC<FriendActionButtonsProps> = ({
  targetUser,
  currentUser,
  isFriend,
  receivedRequests,
  sentRequests,
  onSend,
  onCancel,
  onAccept,
  onReject,
  onUnfriend,
}) => {
  console.log('FriendActionButtons: currentUser', currentUser);
  console.log('FriendActionButtons: targetUser', targetUser);

  if (!currentUser || targetUser.id === currentUser.id) return null;

  const receivedRequest = receivedRequests.find(
    (req) => req.from_user.id === targetUser.id
  );

  const sentRequest = sentRequests.find(
    (req) => req.to_user.user.id === targetUser.id
  );

  if (isFriend) {
    return (
      <div className="relative inline-block">
        <button className="bg-green-500 text-white px-2 py-1 rounded">Friends</button>
        <button
          className="bg-red-500 text-white px-2 py-1 rounded ml-2"
          onClick={() => onUnfriend(targetUser.id)}
        >
          Unfriend
        </button>
      </div>
    );
  } else if (receivedRequest) {
    return (
      <>
        <button
          className="bg-green-500 text-white px-2 py-1 rounded"
          onClick={() => onAccept(receivedRequest.id)}
        >
          Accept
        </button>
        <button
          className="bg-red-500 text-white px-2 py-1 rounded ml-2"
          onClick={() => onReject(receivedRequest.id)}
        >
          Reject
        </button>
      </>
    );
  } else if (sentRequest) {
    return (
      <>
        <span className="text-gray-500">Friend Request Sent</span>
        <button
          className="bg-yellow-500 text-white px-2 py-1 rounded ml-2"
          onClick={() => onCancel(sentRequest.id)}
        >
          Cancel Request
        </button>
      </>
    );
  } else {
    return (
      <button
        className="bg-blue-500 text-white px-2 py-1 rounded"
        onClick={() => onSend(targetUser.id)}
      >
        Add Friend
      </button>
    );
  }
};

export default FriendActionButtons; 
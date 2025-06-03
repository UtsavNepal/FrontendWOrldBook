import React from 'react';

interface User {
  id: string | number;
  username: string;
  profile_picture?: string;
}

interface FriendRequest {
  id: string;
  from_user: { id: string | number; username: string };
  to_user: { id: string | number; username: string };
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface FriendActionButtonsProps {
  targetUser: User;
  currentUser: User;
  isFriend: boolean;
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onSend: (userId: string | number) => Promise<void>;
  onCancel: (requestId: string) => Promise<void>;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  onUnfriend: (userId: string | number) => Promise<void>;
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
  if (!currentUser || targetUser.id === currentUser.id) return null;


  const receivedRequest = receivedRequests.find(
    (req) => String(req.from_user.id) === String(targetUser.id)
  );

  const sentRequest = sentRequests.find(
    (req) => String(req.to_user.id) === String(targetUser.id)
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
          Cancel
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
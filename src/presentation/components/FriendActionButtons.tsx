import React from 'react';
import { FriendRequest } from '../../core/domain/entities/Friend.entity';
import { refersTo } from '../../utils/friendStatus';

interface User {
  id: string;
  username?: string;
  profile_picture?: string;
}

interface FriendActionButtonsProps {
  targetUser: User;
  currentUser: User;
  isFriend: boolean;
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  onSend: (userId: string) => Promise<void>;
  onCancel: (requestId: string) => Promise<void>;
  onAccept: (requestId: string) => Promise<void>;
  onReject: (requestId: string) => Promise<void>;
  onUnfriend: (userId: string) => Promise<void>;
}

const sameId = (left?: string | number, right?: string | number) =>
  String(left ?? "") === String(right ?? "");

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
  if (!currentUser || sameId(targetUser.id, currentUser.id)) return null;

  const receivedRequest = receivedRequests.find((req) => refersTo(req.from_user, targetUser));

  const sentRequest = sentRequests.find((req) => refersTo(req.to_user, targetUser));

  if (isFriend) {
    return (
      <div className="flex flex-wrap gap-2">
        <span className="wb-btn-secondary">Friends</span>
        <button className="wb-btn-danger" onClick={() => onUnfriend(targetUser.id)}>
          Unfriend
        </button>
      </div>
    );
  }

  if (receivedRequest) {
    return (
      <div className="flex flex-wrap gap-2">
        <button className="wb-btn-primary" onClick={() => onAccept(receivedRequest.id)}>
          Accept
        </button>
        <button className="wb-btn-secondary" onClick={() => onReject(receivedRequest.id)}>
          Decline
        </button>
      </div>
    );
  }

  if (sentRequest) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-wb-muted">Request sent</span>
        <button className="wb-btn-secondary" onClick={() => onCancel(sentRequest.id)}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button className="wb-btn-primary" onClick={() => onSend(targetUser.id)}>
      Add friend
    </button>
  );
};

export default FriendActionButtons;

import React, { useEffect, useState } from "react";
import { useFriendContext } from "../../../core/application/context/FriendContext";
import { Link } from "react-router-dom";
import { useAuth } from "../../../core/application/context/AuthContext";
import FriendActionButtons from "../../components/FriendActionButtons";
import { friendRepository } from '../../../infrastructure/repositories/FriendRepository';
import { SpinnerOverlay } from "../../ui/Spinner";

const BACKEND_BASE_URL = "http://127.0.0.1:8000";

const getImageUrl = (url: string) => {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${BACKEND_BASE_URL}${url}`;
};

const FriendPage: React.FC = () => {
  const {
    friendRequests,
    otherUsers,
    acceptFriendRequest,
    rejectFriendRequest,
    sendFriendRequest,
    getFriendRequests,
    fetchOtherUsersProfiles,
  } = useFriendContext();
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setFriendsLoading(true);
      setFetchError(null);
      try {
        await Promise.all([getFriendRequests(), fetchOtherUsersProfiles()]);
        if (user) {
          try {
            const friendsData = await friendRepository.getFriends();
            setFriends(friendsData);
            const received = await friendRepository.listFriendRequests();
            setReceivedRequests(received);
            const sent = await friendRepository.listSentFriendRequests();
            setSentRequests(sent);
            setFriendsLoading(false);
          } catch (err) {
            setFetchError("You are not authorized. Please log in again.");
            setFriendsLoading(false);
          }
        } else {
          setFriendsLoading(false);
        }
      } catch (error) {
        setFetchError("Failed to fetch friends list.");
        setFriendsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const uniqueFriends = friends
    ? friends.filter((friend, idx, arr) => arr.findIndex(f => f.id === friend.id) === idx)
    : [];

  const refreshData = async () => {
    setFriendsLoading(true);
    if (user) {
      const friendsData = await friendRepository.getFriends();
      setFriends(friendsData);
      const received = await friendRepository.listFriendRequests();
      setReceivedRequests(received);
      const sent = await friendRepository.listSentFriendRequests();
      setSentRequests(sent);
      setFriendsLoading(false);
    }
  };

  const handleSendFriendRequest = async (userId: string | number) => {
    try {
      await sendFriendRequest(String(userId));
      await refreshData();
    } catch (err: any) {
      if (err?.response?.data?.error?.toLowerCase().includes('already sent')) {
        await refreshData();
      }
    }
  };
  const handleCancelFriendRequest = async (requestId: string) => {
    if (requestId) {
      await friendRepository.cancelSentFriendRequest(requestId);
      await refreshData();
    }
  };
  const handleAcceptFriendRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
    await refreshData();
  };
  const handleRejectFriendRequest = async (requestId: string) => {
    await rejectFriendRequest(requestId);
    await refreshData();
  };
  const handleUnfriend = async (userId: string | number) => {
    await refreshData();
  };

  if (isLoading || friendsLoading) {
    return <SpinnerOverlay />;
  }

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 pl-20 sm:pl-24 md:pl-32">
      {(isLoading || friendsLoading) && <SpinnerOverlay />}
      <div className="w-full max-w-xl p-2 sm:p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md mt-8 mx-auto">
        {fetchError && <div className="text-red-500 mb-4">{fetchError}</div>}
        <h1 className="text-2xl font-bold mb-4 text-center">Your Friends</h1>
        <ul className="space-y-2 mb-8">
          {uniqueFriends.length === 0 && <li className="text-center">No friends yet.</li>}
          {uniqueFriends.map((friend, idx) => (
            <li key={`${friend.id}_${idx}`} className="flex flex-col sm:flex-row items-center justify-between p-2 border rounded bg-gray-100">
              <div className="flex items-center mb-2 sm:mb-0">
                <img
                  src={getImageUrl(friend.profile_picture)}
                  alt={friend.username}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <span className="font-semibold text-sm sm:text-base">{friend.username}</span>
              </div>
              <Link
                to={`/profile/${friend.id}`}
                className="bg-gray-500 text-white px-2 py-1 rounded text-xs sm:text-sm"
              >
                View Profile
              </Link>
            </li>
          ))}
        </ul>
        <h1 className="text-2xl font-bold mb-4 text-center">Friend Requests</h1>
        <ul className="space-y-2">
          {friendRequests.map((request) => (
            <li key={request.id} className="flex flex-col sm:flex-row items-center justify-between p-2 border rounded bg-gray-100">
              <div className="flex items-center gap-2 mb-2 sm:mb-0">
                <span className="font-semibold text-sm sm:text-base">{request.from_user.username}</span>
                <span className="text-gray-500 text-xs sm:text-sm"> sent you a friend request</span>
                <Link
                  to={`/profile/${request.from_user.id}`}
                  className="bg-gray-500 text-white px-2 py-1 rounded text-xs sm:text-sm"
                >
                  View Profile
                </Link>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => acceptFriendRequest(request.id)}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs sm:text-sm"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectFriendRequest(request.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs sm:text-sm"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
        <h1 className="text-2xl font-bold mt-8 mb-4 text-center">People You Might Know</h1>
        {!friendsLoading && (
          <ul className="space-y-2">
            {otherUsers
              .filter((otherUser) => {
                if (!user || otherUser.id === user.id) return false;
                return !friends.some(friend => String(friend.id) === String(otherUser.id));
              })
              .map((otherUser) => {
                return (
                  <li key={otherUser.username} className="flex flex-col sm:flex-row items-center justify-between p-2 border rounded bg-gray-100">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <img
                        src={getImageUrl(otherUser.profile_picture)}
                        alt={otherUser.username}
                        className="w-10 h-10 rounded-full mr-2"
                      />
                      <span className="font-semibold text-sm sm:text-base">{otherUser.username}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <FriendActionButtons
                        targetUser={otherUser}
                        currentUser={user}
                        isFriend={friends.some(friend => String(friend.id) === String(otherUser.id))}
                        receivedRequests={receivedRequests}
                        sentRequests={sentRequests}
                        onSend={handleSendFriendRequest}
                        onCancel={handleCancelFriendRequest}
                        onAccept={handleAcceptFriendRequest}
                        onReject={handleRejectFriendRequest}
                        onUnfriend={handleUnfriend}
                      />
                      <Link
                        to={`/profile/${otherUser.id}`}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-xs sm:text-sm"
                      >
                        View Profile
                      </Link>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FriendPage;
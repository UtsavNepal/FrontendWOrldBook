import React, { useEffect, useState } from "react";
import { useFriendContext } from "../../../core/application/context/FriendContext";
import { Link } from "react-router-dom";
import { useAuth } from "../../../core/application/context/AuthContext";
import FriendActionButtons from "../../components/FriendActionButtons";
import { friendRepository } from '../../../infrastructure/repositories/FriendRepository';
import { SpinnerOverlay } from "../../ui/Spinner";
import MainLayout from "../../components/MainLayout";




const getImageUrl = (url?: string): string => {
  if (!url) return "/default-avatar.png";
  if (url.startsWith('http')) return url;
  return `${import.meta.env.VITE_BACKEND_URL}${url}`;
};

const FriendPage: React.FC = () => {
  const {
    friendRequests,
    otherUsers,
    acceptFriendRequest,
    rejectFriendRequest,
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

  const handleSendFriendRequest = async (userId: number) => {
      try {
        await friendRepository.sendFriendRequest(String(userId));
        await refreshData();
      } catch (err: any) {
        if (err?.response?.data?.error?.toLowerCase().includes('already sent')) {
          await refreshData();
        }
      }
    };

  const handleCancelFriendRequest = async (requestId: number) => {
    if (requestId) {
      await friendRepository.cancelFriendRequest(requestId);
      await refreshData();
    }
  };
  const handleAcceptFriendRequest = async (requestId: number) => {
    await acceptFriendRequest(requestId);
    await refreshData();
  };
  const handleRejectFriendRequest = async (requestId: number) => {
    await rejectFriendRequest(requestId);
    await refreshData();
  };
  const handleUnfriend = async () => {
    await refreshData();
  };

  if (isLoading || friendsLoading) {
    return <SpinnerOverlay />;
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex justify-center items-start bg-gray-100 pl-0 sm:pl-0 md:pl-0 py-8">
        <div className="w-full max-w-2xl px-2 sm:px-4 md:px-6 lg:px-8 flex-1 h-full">
          {fetchError && <div className="text-red-500 mb-4">{fetchError}</div>}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Your Friends</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {uniqueFriends.length === 0 && (
                <div className="col-span-full text-center text-gray-500 bg-white rounded-lg shadow p-6">No friends yet.</div>
              )}
              {uniqueFriends.map((friend, idx) => (
                <div key={`${friend.id}_${idx}`} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                  <img
                    src={getImageUrl(friend.profile_picture)}
                    alt={friend.username}
                    className="w-16 h-16 rounded-full mb-2 border-2 border-gray-200 object-cover"
                  />
                  <span className="font-semibold text-base text-gray-700 mb-1">{friend.username}</span>
                  <Link
                    to={`/profile/${friend.id}`}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs mt-2"
                  >
                    View Profile
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Friend Requests</h1>
            <div className="grid grid-cols-1 gap-4">
              {friendRequests.length === 0 && (
                <div className="text-center text-gray-500 bg-white rounded-lg shadow p-6">No friend requests.</div>
              )}
              {friendRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row items-center justify-between">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <img
                      src={getImageUrl(request.from_user.profile_picture)}
                      alt={request.from_user.username}
                      className="w-12 h-12 rounded-full border-2 border-gray-200 object-cover"
                    />
                    <div>
                      <span className="font-semibold text-base text-gray-700">{request.from_user.username}</span>
                      <span className="block text-gray-500 text-xs">sent you a friend request</span>
                    </div>
                    <Link
                      to={`/profile/${request.from_user.id}`}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs ml-2"
                    >
                      View Profile
                    </Link>
                  </div>
                  <div className="flex gap-2 mt-2 sm:mt-0">
                    <button
                      onClick={() => acceptFriendRequest(request.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(request.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">People You Might Know</h1>
            {!friendsLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherUsers
                  .filter((otherUser) => {
                    if (!user || otherUser.user.id === user.id) return false;
                    return !friends.some(friend => String(friend.user?.id) === String(otherUser.user.id));
                  })
                  .map((otherUser) => (
                    <div key={otherUser.username} className="bg-white rounded-lg shadow p-4 flex flex-col items-center">
                      <img
                        src={getImageUrl(otherUser.profile_picture)}
                        alt={otherUser.username}
                        className="w-16 h-16 rounded-full mb-2 border-2 border-gray-200 object-cover"
                      />
                      <span className="font-semibold text-base text-gray-700 mb-1">{otherUser.username}</span>
                      <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                        <FriendActionButtons
                          targetUser={{ ...otherUser, id: Number(otherUser.user.id) }}
                          currentUser={user}
                          isFriend={friends.some(friend => String(friend.user?.id) === String(otherUser.user.id))}
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
                          className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                {otherUsers.filter((otherUser) => {
                  if (!user || otherUser.user.id === user.id) return false;
                  return !friends.some(friend => String(friend.user?.id) === String(otherUser.user.id));
                }).length === 0 && (
                  <div className="col-span-full text-center text-gray-500 bg-white rounded-lg shadow p-6">No suggestions at the moment.</div>
                )}
              </div>
            )}
          </div>
        </div>
        {(isLoading || friendsLoading) && <SpinnerOverlay />}
      </div>
    </MainLayout>
  );
};

export default FriendPage;
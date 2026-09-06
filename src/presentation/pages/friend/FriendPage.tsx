import React, { useEffect, useState } from "react";
import { useFriendContext } from "../../../core/application/context/FriendContext";
import { Link } from "react-router-dom";
import { useAuth } from "../../../core/application/context/AuthContext";
import FriendActionButtons from "../../components/FriendActionButtons";
import { friendRepository } from '../../../infrastructure/repositories/FriendRepository';
import { SpinnerOverlay } from "../../ui/Spinner";
import MainLayout from "../../components/MainLayout";
import PageShell from "../../components/PageShell";
import { getImageUrl } from '../../../utils/getImageUrl';
import { ERRORS } from "../../../constants/errors";

const FriendPage: React.FC = () => {
  const {
    friendRequests,
    otherUsers,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriendRequests,
    getSentFriendRequests,
    fetchOtherUsersProfiles,
    sendFriendRequest,
    cancelFriendRequest,
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
            await getSentFriendRequests();
            const sent = await friendRepository.listSentFriendRequests();
            setSentRequests(sent);
            setFriendsLoading(false);
          } catch (err) {
            setFetchError(ERRORS.auth.unauthorized);
            setFriendsLoading(false);
          }
        } else {
          setFriendsLoading(false);
        }
      } catch (error) {
        setFetchError(ERRORS.friend.fetchFailed);
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
    if (user) {
      const friendsData = await friendRepository.getFriends();
      setFriends(friendsData);
      const received = await friendRepository.listFriendRequests();
      setReceivedRequests(received);
      await getSentFriendRequests();
      const sent = await friendRepository.listSentFriendRequests();
      setSentRequests(sent);
    }
  };

  const handleSendFriendRequest = async (userId: string) => {
    try {
      const created = await sendFriendRequest(userId);
      if (created) {
        setSentRequests((requests) =>
          requests.some((request) => String(request.id) === String(created.id))
            ? requests
            : [...requests, created]
        );
      }
    } catch (err: any) {
      if (err?.response?.data?.error?.toLowerCase().includes("already sent")) {
        await refreshData();
      }
    }
  };

  const handleCancelFriendRequest = async (requestId: string) => {
    if (!requestId) return;
    setSentRequests((requests) => requests.filter((request) => String(request.id) !== String(requestId)));
    await cancelFriendRequest(requestId);
  };
  const handleAcceptFriendRequest = async (requestId: string) => {
    await acceptFriendRequest(requestId);
    await refreshData();
  };
  const handleRejectFriendRequest = async (requestId: string) => {
    await rejectFriendRequest(requestId);
    await refreshData();
  };
  const handleUnfriend = async () => {
    await refreshData();
  };

  if (isLoading) {
    return <SpinnerOverlay />;
  }

  const suggestions = otherUsers.filter((otherUser) => {
    if (!user || otherUser.user.id === user.id) return false;
    return !friends.some(friend => String(friend.user?.id) === String(otherUser.user.id));
  });

  return (
    <MainLayout>
      <PageShell title="Friends" wide>
        {fetchError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{fetchError}</div>}

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold">Friend requests</h2>
          {friendRequests.length === 0 ? (
            <div className="wb-empty">No pending requests.</div>
          ) : (
            <div className="space-y-3">
              {friendRequests.map((request) => (
                <div key={request.id} className="wb-card flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(request.from_user.profile_picture)}
                      alt={request.from_user.username}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{request.from_user.username}</p>
                      <p className="text-xs text-wb-muted">sent you a friend request</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => acceptFriendRequest(request.id)} className="wb-btn-primary">
                      Confirm
                    </button>
                    <button onClick={() => rejectFriendRequest(request.id)} className="wb-btn-secondary">
                      Delete
                    </button>
                    <Link to={`/profile/${request.from_user.id}`} className="wb-btn-secondary">
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold">Your friends</h2>
          {uniqueFriends.length === 0 ? (
            <div className="wb-empty">You haven't added any friends yet.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {uniqueFriends.map((friend, idx) => (
                <div key={`${friend.id}_${idx}`} className="wb-card flex items-center gap-3 p-4">
                  <img
                    src={getImageUrl(friend.profile_picture)}
                    alt={friend.username}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{friend.username}</p>
                    <Link to={`/profile/${friend.id}`} className="text-xs font-semibold text-wb-blue">
                      View profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">People you may know</h2>
          {suggestions.length === 0 ? (
            <div className="wb-empty">No suggestions right now.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {suggestions.map((otherUser) => (
                <div key={otherUser.username} className="wb-card flex flex-col items-center p-5 text-center">
                  <img
                    src={getImageUrl(otherUser.profile_picture)}
                    alt={otherUser.username}
                    className="mb-3 h-16 w-16 rounded-full object-cover"
                  />
                  <p className="mb-3 font-semibold">{otherUser.username}</p>
                  <FriendActionButtons
                    targetUser={{ ...otherUser, id: String(otherUser.user.id) }}
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
                  <Link to={`/profile/${otherUser.id}`} className="mt-2 text-xs font-semibold text-wb-blue">
                    View profile
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </PageShell>
    </MainLayout>
  );
};

export default FriendPage;

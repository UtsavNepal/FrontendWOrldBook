import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/application/context/AuthContext";
import { Profile } from "../../../core/domain/entities/Profile.entity";
import { profileRepository } from '../../../infrastructure/repositories/ProfileRepository';
import MainLayout from "../../components/MainLayout";
import { friendRepository } from '../../../infrastructure/repositories/FriendRepository';
import { postRepository } from '../../../infrastructure/repositories/PostRepository';
import Spinner from "../../ui/Spinner";
import { getImageUrl } from '../../../utils/getImageUrl';
import UserListItem from "../../components/UserListItem";
import { useFriendContext } from "../../../core/application/context/FriendContext";
import { useProfile } from "../../../core/application/context/ProfileContext";


const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [following, setFollowing] = useState(false);
  const [showFollowDropdown, setShowFollowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following' | 'friends'>('posts');
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const { unfriend } = useFriendContext();
  const { profile: authProfile } = useProfile();

  const receivedRequestFromUser = receivedRequests.find((r: any) => r.from_user.id === Number(id));
  const sentRequestToUser = sentRequests.find((r: any) => r.to_user.id === Number(id));

  const fetchFollowStatus = async () => {
    try {
      const followers = await profileRepository.getFollowers(id!);
      if (user) {
        setFollowing(followers.some((f: any) => f.user && f.user.id === user.id));
      }
    } catch (err) {
      setFollowing(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setProfile(null);
      try {
        const res = await profileRepository.getPublicProfile(id!);
        setProfile(res);
        setPosts(res.posts || []);
      } catch (err) {
        setProfile(null);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchFriendRequestStatus = async () => {
      try {
        const received = await friendRepository.listFriendRequests();
        setReceivedRequests(received);
        const sent = await friendRepository.listSentFriendRequests();
        setSentRequests(sent);
        const sentReq = sent.find((r: any) => r.to_user.id === Number(id));
        if (sentReq) {
          setFriendRequestId(String(sentReq.id));
        } else {
          setFriendRequestId(null);
        }
      } catch (err) {
        setFriendRequestId(null);
      }
    };
    fetchProfile();
    fetchFriendRequestStatus();
    fetchFollowStatus();
  }, [id, user]);

  const handleLike = async (postId: number) => {
    await postRepository.toggleLikePost(postId);
    
  };

  const handleComment = async (postId: number) => {
    if (!commentText.trim()) return;
    await postRepository.commentOnPost(postId, commentText);
    setCommentText("");
    setCommentingPostId(null);
  };

  const handleSendFriendRequest = async () => {
    try {
      await friendRepository.sendFriendRequest(String(profile!.user.id));
      await refreshData();
    } catch (err: any) {
      if (err?.response?.data?.error?.toLowerCase().includes('already sent')) {
        await refreshData();
      }
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!friendRequestId) return;

    // Optimistically update UI
    setFriendRequestId(null);

    // Remove the request from local sentRequests state
    setSentRequests(requests => requests.filter((r: any) => r.id !== friendRequestId));

    // Send backend request and refresh data in background
    const id = typeof friendRequestId === 'string' ? parseInt(friendRequestId, 10) : friendRequestId;
    if (!isNaN(id)) {
      friendRepository.rejectFriendRequest(id)
        .finally(async () => {
          await refreshData();
          await fetchFollowersList();
          await fetchFollowingList();
          await fetchFollowStatus();
        });
    }
  };

  const handleFollow = async () => {
    await profileRepository.followUser(id!);
    setFollowing(true);
    await fetchFollowersList();
    await fetchFollowingList();
    setShowFollowDropdown(false);
  };

  const handleUnfollow = async () => {
    await profileRepository.unfollowUser(id!);
    setFollowing(false);
    await fetchFollowersList();
    await fetchFollowingList();
    setShowFollowDropdown(false);
  };

  const handleUnfriend = async (userId: number) => {
    try {
      await unfriend(userId);
      setProfile(profile => profile ? { ...profile, is_friend: false } : profile);
      setFriendRequestId(null);
      await refreshData();
      await fetchFriendsList();
    } catch (error) {
      console.error('Error unfriending:', error);
    }
  };

  // Refresh all relevant data
  const refreshData = async () => {
    setLoading(true);
    setProfile(null);
    try {
      const res = await profileRepository.getPublicProfile(id!);
      setProfile(res);
      setPosts(res.posts || []);
    } catch (err) {
      setProfile(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowersList = async () => {
    setLoadingFollowers(true);
    try {
      const followers = await profileRepository.getFollowers(id!);
      setFollowersList(followers);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowingList = async () => {
    setLoadingFollowing(true);
    try {
      const following = await profileRepository.getFollowing(id!);
      setFollowingList(following);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const fetchFriendsList = async () => {
    setLoadingFriends(true);
    try {
      const friends = await profileRepository.getFriendsForUser(id!);
      setFriendsList(friends);
    } finally {
      setLoadingFriends(false);
    }
  };

  if (profile && user && profile.id === user.profile?.id) {
    navigate('/welcome', { replace: true });
    return null;
  }

  if (loading) return <Spinner />;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <MainLayout>
      <div className="flex flex-col items-center bg-gray-50 min-h-screen w-full">
        {/* Cover Photo */}
        <div className="w-full relative h-48 sm:h-64 md:h-72 bg-gray-300 dark:bg-gray-700">
          <img
            src={profile.cover_photo ? getImageUrl(profile.cover_photo) || '' : '/default-cover.jpg'}
            alt="Cover"
            className="w-full h-full object-cover object-center"
          />
          {/* Profile Picture - Overlapping */}
          <div className="absolute left-8 bottom-[-48px] sm:bottom-[-64px] md:bottom-[-72px]">
            <img
              src={profile.profile_picture ? getImageUrl(profile.profile_picture) || '' : '/default-avatar.png'}
              alt="Profile"
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-lg bg-gray-200 dark:bg-gray-900"
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between w-full max-w-4xl mt-16 px-4 gap-4">
          
          <div className="flex flex-col items-start flex-1 min-w-[200px]">
            <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">{profile.username}</div>
            <div className="text-base text-gray-700 dark:text-gray-300 mb-2">{profile.bio}</div>
          </div>
          {/* Right: Actions */}
          <div className="flex flex-col items-end gap-2 min-w-[220px]">
            {user && String(user.id) !== String(id) && (
              <div className="flex flex-row flex-wrap gap-2 w-full justify-end">
                {profile.is_friend ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowFollowDropdown((v) => !v)}
                      className="border border-gray-300 text-gray-700 dark:text-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                      Friends
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {showFollowDropdown && (
                      <div className="absolute left-0 mt-2 bg-white dark:bg-gray-900 border rounded shadow z-10 min-w-[140px]">
                        {following ? (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                            onClick={() => { handleUnfollow(); setShowFollowDropdown(false); }}
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                            onClick={() => { handleFollow(); setShowFollowDropdown(false); }}
                          >
                            Follow
                          </button>
                        )}
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
                          onClick={() => { handleUnfriend(profile!.user.id); setShowFollowDropdown(false); }}
                        >
                          Unfriend
                        </button>
                      </div>
                    )}
                  </div>
                ) : receivedRequestFromUser ? (
                  <>
                    <button
                      onClick={async () => {
                        await friendRepository.acceptFriendRequest(receivedRequestFromUser.id);
                        setProfile(profile => profile ? { ...profile, is_friend: true } : profile);
                        setReceivedRequests(requests => requests.filter((r: any) => r.id !== receivedRequestFromUser.id));
                        await refreshData();
                      }}
                      className="border border-gray-300 text-gray-700 dark:text-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        await friendRepository.rejectFriendRequest(receivedRequestFromUser.id);
                        setReceivedRequests(requests => requests.filter((r: any) => r.id !== receivedRequestFromUser.id));
                        await refreshData();
                      }}
                      className="border border-gray-300 text-gray-700 dark:text-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Reject
                    </button>
                  </>
                ) : sentRequestToUser ? (
                  <>
                    <span className="text-gray-500">Friend Request Sent</span>
                    <button
                      onClick={() => handleCancelFriendRequest()}
                      className="border border-gray-300 text-gray-700 dark:text-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancel Request
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSendFriendRequest}
                    className="border border-gray-300 text-gray-700 dark:text-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Add Friend
                  </button>
                )}
                <button
                  className="border border-gray-300 text-gray-700 dark:text-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => navigate(`/chat?user=${id}`)}
                >
                  Message
                </button>
              </div>
            )}
            
          </div>
        </div>
        {/* Tabs */}
        <div className="flex flex-wrap sm:flex-nowrap justify-center gap-2 sm:gap-8 border-b pb-2 mb-4 mt-8 w-full max-w-4xl overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
          <button className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-semibold whitespace-nowrap ${activeTab === 'posts' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => setActiveTab('posts')}>Posts </button>
          <button className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-semibold whitespace-nowrap ${activeTab === 'followers' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => { setActiveTab('followers'); fetchFollowersList(); }}>Followers </button>
          <button className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-semibold whitespace-nowrap ${activeTab === 'following' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => { setActiveTab('following'); fetchFollowingList(); }}>Following </button>
          <button className={`px-2 sm:px-4 py-1 sm:py-2 text-sm sm:text-base font-semibold whitespace-nowrap ${activeTab === 'friends' ? 'border-b-2 border-blue-500' : ''}`} onClick={() => { setActiveTab('friends'); fetchFriendsList(); }}>Friends </button>
        </div>
        {/* Tab Content */}
        <div className="w-full max-w-xl p-2 sm:p-4 md:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8 mx-auto flex-1 h-full">
          {activeTab === 'posts' && (
            <div>
              {posts.length === 0 && <div>No posts to show.</div>}
              {posts.map((post) => (
                <div key={post.id} className="border rounded p-4 mb-4">
                  {post.image && getImageUrl(post.image) && (
                    <img src={getImageUrl(post.image) || undefined} alt="Post" className="w-full h-48 object-cover mb-2" />
                  )}
                  <p>{post.content}</p>
                  <div className="flex space-x-4 mt-2">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="text-blue-500 hover:underline"
                    >
                      Like ({post.likes})
                    </button>
                    <button
                      onClick={() => setCommentingPostId(post.id)}
                      className="text-green-500 hover:underline"
                    >
                      Comment
                    </button>
                  </div>
                  {commentingPostId === post.id && (
                    <div className="mt-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="border p-1 rounded w-2/3"
                        placeholder="Write a comment..."
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Post
                      </button>
                    </div>
                  )}
                  <div className="mt-2">
                    <h4 className="font-semibold">Comments</h4>
                    {post.comments?.map((comment: any) => (
                      <div key={comment.id} className="text-sm border-b py-1">
                        <span className="font-semibold">{comment.profile?.username}:</span> {comment.comment}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'followers' && (
            <div className="mt-2">
              {loadingFollowers ? <Spinner /> : (
                <ul className="space-y-4">
                  {followersList.filter(f => f.id !== user?.profile?.id).length === 0 ? <li>No followers yet.</li> : followersList.filter(f => f.id !== user?.profile?.id).map(f => (
                    <UserListItem
                    key={f.id}
                    user={f}
                    type="following"
                    onUnfollow={handleUnfollow}
                    authenticatedProfileId={authProfile?.id}
                  />
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === 'following' && (
            <div className="mt-2">
              {loadingFollowing ? <Spinner /> : (
                <ul className="space-y-4">
                  {followingList.length === 0 ? <li>Not following anyone yet.</li> : followingList.map(f => (
                    <UserListItem key={f.id} user={f} type="following" onUnfollow={handleUnfollow} authenticatedProfileId={authProfile?.id} />
                  ))}
                </ul>
              )}
            </div>
          )}
          {activeTab === 'friends' && (
            <div className="mt-2">
              {loadingFriends ? <Spinner /> : (
                <ul className="space-y-4">
                  {friendsList.filter(f => f.id !== user?.profile?.id && f.id !== profile?.id).length === 0 ? <div className="col-span-full">No friends yet.</div> : friendsList.filter(f => f.id !== user?.profile?.id && f.id !== profile?.id).map(f => (
                    <UserListItem key={f.id} user={f} type="friends" onUnfriend={handleUnfriend} authenticatedProfileId={authProfile?.id} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {/* Show all received friend requests if any */}
        {receivedRequests.length > 0 && (
          <div className="mb-6 w-full max-w-4xl">
            <h3 className="text-xl font-semibold mb-2">Friend Requests</h3>
            <div className="flex flex-wrap gap-2">
              {receivedRequests.map((req: any) => (
                <div key={req.id} className="flex items-center gap-2 border p-2 rounded">
                  <span>{req.from_user.username}</span>
                  <button
                    onClick={async () => {
                      await friendRepository.acceptFriendRequest(req.id);
                      setProfile(profile => profile ? { ...profile, is_friend: true } : profile);
                      setReceivedRequests(requests => requests.filter((r: any) => r.id !== req.id));
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={async () => {
                      await friendRepository.rejectFriendRequest(req.id);
                      setReceivedRequests(requests => requests.filter((r: any) => r.id !== req.id));
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserProfilePage; 
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/application/context/AuthContext";
import { Profile } from "../../../core/domain/entities/Profile.entity";
import { profileRepository } from '../../../infrastructure/repositories/ProfileRepository';
import MainLayout from "../../components/MainLayout";
import { friendRepository } from '../../../infrastructure/repositories/FriendRepository';
import { postRepository } from '../../../infrastructure/repositories/PostRepository';
import Spinner from "../../ui/Spinner";
import { Modal } from '../../pages/modal/modal';
import UserList from '../../components/UserList';

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
 
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
      } catch (err) {
        setProfile(null);
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

  const handleUnfriend = async () => {
    try {
      await friendRepository.unfriend(profile!.user.id);
      setProfile(profile => profile ? { ...profile, is_friend: false } : profile);
      setFriendRequestId(null);
      await refreshData();
    } catch (error) {
      console.error('Error unfriending:', error);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BACKEND_BASE_URL}${url}`;
  };

  // Refresh all relevant data
  const refreshData = async () => {
    setLoading(true);
    setProfile(null);
    try {
      const res = await profileRepository.getPublicProfile(id!);
      setProfile(res);
    } catch (err) {
      setProfile(null);
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

  if (loading) return <Spinner />;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <MainLayout>
      <div className="flex justify-center items-start bg-gray-50 min-h-screen">
        {/* DEBUG INFO - REMOVE IN PRODUCTION */}
        
        <div className="w-full max-w-xl p-2 sm:p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md mt-8 mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-8 mb-8 relative">
            {/* Profile Picture and Bio */}
            <div className="flex-shrink-0 flex flex-col items-center">
              <img
                src={getImageUrl(profile.profile_picture) || undefined}
                alt={profile.username}
                className="w-36 h-36 rounded-full object-cover bg-gray-200 border-4 border-blue-500"
                style={{ display: getImageUrl(profile.profile_picture) ? undefined : 'none' }}
              />
              <span className="mt-2 text-lg text-gray-500">Profile picture</span>
              <span className="mt-2 text-base text-gray-700">{profile.bio}</span>
            </div>
            {/* Username, Gender, Stats, Actions */}
            <div className="flex-1 flex flex-col items-center sm:items-start justify-center gap-2 mt-6 sm:mt-0">
              <div className="text-2xl font-bold text-gray-800 mt-2">{profile.username}</div>
              <div className="text-base text-gray-700 mb-2">{profile.user.gender}</div>
              <div className="flex flex-row gap-8 mb-2 text-lg sm:text-xl font-medium text-gray-800">
                <span>{profile.total_posts} Posts</span>
                <span className="cursor-pointer hover:underline" onClick={() => { setShowFollowersModal(true); fetchFollowersList(); }}>{profile.total_followers ?? 0} Followers</span>
                <span className="cursor-pointer hover:underline" onClick={() => { setShowFollowingModal(true); fetchFollowingList(); }}>{profile.total_following ?? 0} Following</span>
              </div>
              {/* Friend/Message Actions */}
              {user && String(user.id) !== String(id) && (
                <div className="flex flex-row flex-wrap gap-4 mt-2 w-full">
                  {profile.is_friend ? (
                    <div className="relative">
                      <button
                        onClick={() => setShowFollowDropdown((v) => !v)}
                        className="border border-gray-300 text-gray-700 px-2 py-1 rounded bg-white hover:bg-gray-100 flex items-center gap-2"
                      >
                        Friends
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {showFollowDropdown && (
                        <div className="absolute left-0 mt-2 bg-white border rounded shadow z-10 min-w-[140px]">
                          {following ? (
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                              onClick={() => { handleUnfollow(); setShowFollowDropdown(false); }}
                            >
                              Unfollow
                            </button>
                          ) : (
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                              onClick={() => { handleFollow(); setShowFollowDropdown(false); }}
                            >
                              Follow
                            </button>
                          )}
                          <button
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                            onClick={() => { handleUnfriend(); setShowFollowDropdown(false); }}
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
                        className="border border-gray-300 text-gray-700 px-2 py-1 rounded bg-white hover:bg-gray-100"
                      >
                        Accept
                      </button>
                      <button
                        onClick={async () => {
                          await friendRepository.rejectFriendRequest(receivedRequestFromUser.id);
                          setReceivedRequests(requests => requests.filter((r: any) => r.id !== receivedRequestFromUser.id));
                          await refreshData();
                        }}
                        className="border border-gray-300 text-gray-700 px-2 py-1 rounded bg-white hover:bg-gray-100"
                      >
                        Reject
                      </button>
                    </>
                  ) : sentRequestToUser ? (
                    <>
                      <span className="text-gray-500">Friend Request Sent</span>
                      <button
                        onClick={() => handleCancelFriendRequest()}
                        className="border border-gray-300 text-gray-700 px-2 py-1 rounded bg-white hover:bg-gray-100"
                      >
                        Cancel Request
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleSendFriendRequest}
                      className="border border-gray-300 text-gray-700 px-2 py-1 rounded bg-white hover:bg-gray-100"
                    >
                      Add Friend
                    </button>
                  )}
                  <button
                    className="border border-gray-300 text-gray-700 px-2 py-1 rounded bg-white hover:bg-gray-100"
                    onClick={() => navigate(`/chat?user=${id}`)}
                  >
                    Message
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* Posts Section (like/comment only) */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Posts</h3>
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
          {/* Show all received friend requests if any */}
          {receivedRequests.length > 0 && (
            <div className="mb-6">
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
          {/* Followers Modal */}
          <Modal isOpen={showFollowersModal} onClose={() => setShowFollowersModal(false)}>
            <div className="max-w-md mx-auto p-4">
              <UserList users={followersList} title="Followers" loading={loadingFollowers} />
            </div>
          </Modal>
          {/* Following Modal */}
          <Modal isOpen={showFollowingModal} onClose={() => setShowFollowingModal(false)}>
            <div className="max-w-md mx-auto p-4">
              <UserList users={followingList} title="Following" loading={loadingFollowing} />
            </div>
          </Modal>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfilePage; 
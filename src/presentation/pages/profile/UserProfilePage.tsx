import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../core/application/context/AuthContext";
import { Profile } from "../../../core/domain/entities/Profile.entity";

import { profileRepository } from '../../../infrastructure/repositories/ProfileRepository';
import { friendRepository } from '../../../infrastructure/repositories/FriendRepository';
import { postRepository } from '../../../infrastructure/repositories/PostRepository';
import Spinner from "../../ui/Spinner";

const BACKEND_BASE_URL = "http://127.0.0.1:8000";

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
 
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentingPostId, setCommentingPostId] = useState<number | null>(null);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setProfile(null);
      setPosts([]);
      setReceivedRequests([]);
      setSentRequests([]);
      try {
        const res = await profileRepository.getPublicProfile(id!);
        setProfile(res);
        setPosts(res.post_photos || []);
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    const fetchFriendRequestStatus = async () => {
      setReceivedRequests([]);
      setSentRequests([]);
      try {
        const received = await friendRepository.listFriendRequests();
        setReceivedRequests(received);
        const sent = await friendRepository.listSentFriendRequests();
        setSentRequests(sent);
        // Find if there is a sent request to this user
        const sentReq = sent.find((r: any) => r.to_user.id === Number(id));
        if (sentReq) {
          setFriendRequestSent(true);
          setFriendRequestId(sentReq.id);
        } else {
          setFriendRequestSent(false);
          setFriendRequestId(null);
        }
      } catch (err) {
        setFriendRequestSent(false);
        setFriendRequestId(null);
      }
    };
    const fetchFollowStatus = async () => {
      try {
        const followers = await profileRepository.getFollowers(id!);
        if (user) {
          setFollowing(followers.some((f: any) => f.id === user.id));
        }
      } catch (err) {
        setFollowing(false);
      }
    };
    fetchProfile();
    fetchFriendRequestStatus();
    fetchFollowStatus();
  }, [id, user]);

  const handleLike = async (postId: number) => {
    await postRepository.toggleLikePost(postId);
    // Optionally refresh posts
  };

  const handleComment = async (postId: number) => {
    if (!commentText.trim()) return;
    await postRepository.commentOnPost(postId, commentText);
    setCommentText("");
    setCommentingPostId(null);
  };

  const handleSendFriendRequest = async () => {
    try {
      await friendRepository.sendFriendRequest(id!);
      await refreshData();
    } catch (err: any) {
      if (err?.response?.data?.error?.toLowerCase().includes('already sent')) {
        await refreshData();
      }
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!friendRequestId) return;
    await friendRepository.rejectFriendRequest(friendRequestId);
    setFriendRequestSent(false);
    setFriendRequestId(null);
    await refreshData();
  };

  const handleFollow = async () => {
    await profileRepository.followUser(id!);
    setFollowing(true);
  };

  const handleUnfollow = async () => {
    await profileRepository.unfollowUser(id!);
    setFollowing(false);
  };

  const handleUnfriend = async (friendId: string | number) => {
    await friendRepository.unfriend(friendId);
    // Instantly update UI
    setProfile(profile => profile ? { ...profile, is_friend: false } : profile);
    setFriendRequestSent(false);
    setOpenDropdown(null);
  };

  const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BACKEND_BASE_URL}${url}`;
  };

 
  const uniqueFriends = profile?.friends
    ? profile.friends.filter(
        (friend: any, idx: number, arr: any[]) =>
          arr.findIndex(f => f.id === friend.id) === idx
      )
    : [];

  // Helper for received request from this user
  const receivedRequestFromUser = receivedRequests.find((r: any) => r.from_user.id === Number(id));
  const sentRequestToUser = sentRequests.find((r: any) => r.to_user.id === Number(id));

  // Refresh all relevant data
  const refreshData = async () => {
    setLoading(true);
    setProfile(null);
    setPosts([]);
    setReceivedRequests([]);
    setSentRequests([]);
    try {
      const res = await profileRepository.getPublicProfile(id!);
      setProfile(res);
      setPosts(res.post_photos || []);
      const received = await friendRepository.listFriendRequests();
      setReceivedRequests(received);
      const sent = await friendRepository.listSentFriendRequests();
      setSentRequests(sent);
    } catch (err) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div className="min-h-screen flex justify-center items-start bg-gray-50 pl-20 sm:pl-24 md:pl-32">
      <div className="w-full max-w-xl p-2 sm:p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md mt-8 mx-auto">
        <div className="flex flex-col items-center mb-6">
          <img
            src={getImageUrl(profile.profile_picture) || undefined}
            alt={profile.username}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
            style={{ display: getImageUrl(profile.profile_picture) ? undefined : 'none' }}
          />
          <h2 className="text-2xl font-bold mt-2">{profile.username}</h2>
          <p className="text-gray-600">{profile.bio}</p>
          <div className="flex space-x-4 mt-2">
            <span>Posts: {profile.total_posts}</span>
            <span>Friends: {profile.friends?.length || 0}</span>
            <span>Followers: {profile.total_followers}</span>
            <span>Following: {profile.total_following}</span>
          </div>
          {user && user.id !== Number(id) && (
            <div className="flex space-x-2 mt-2">
              {profile.is_friend ? (
                // Friends button with dropdown
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === 'friends' ? null : 'friends')}
                    className="bg-green-500 text-white px-2 py-1 rounded flex items-center"
                  >
                    Friends
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === 'friends' && (
                    <div className="absolute z-10 right-0 mt-2 w-28 bg-white border rounded shadow-lg">
                      <button
                        onClick={() => handleUnfriend(id!)}
                        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
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
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={async () => {
                      await friendRepository.rejectFriendRequest(receivedRequestFromUser.id);
                      setReceivedRequests(requests => requests.filter((r: any) => r.id !== receivedRequestFromUser.id));
                      await refreshData();
                    }}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Reject
                  </button>
                </>
              ) : sentRequestToUser ? (
                <>
                  <span className="text-gray-500">Friend Request Sent</span>
                  <button
                    onClick={handleCancelFriendRequest}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Cancel Request
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSendFriendRequest}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Add Friend
                </button>
              )}
              {following ? (
                <button
                  onClick={handleUnfollow}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Unfollow
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Follow
                </button>
              )}
            </div>
          )}
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{profile.is_friend ? 'Friends' : 'Their Friends'}</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueFriends && uniqueFriends.length > 0 ? (
              uniqueFriends
                .filter((friend: any) => !user || friend.id !== user.id) // Exclude current user
                .map((friend: any, idx: number) => (
                  <div key={`${friend.id}_${idx}`} className="relative flex flex-col items-center group">
                    <img
                      src={getImageUrl(friend.profile_picture) || undefined}
                      alt={friend.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                      style={{ display: getImageUrl(friend.profile_picture) ? undefined : 'none' }}
                    />
                    <span className="text-xs flex items-center">
                      {friend.username}
                      {/* Tick mark if friend */}
                      <svg className="w-4 h-4 text-green-500 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {/* Dropdown for unfriend, only if current user is a friend of the profile being viewed and not self */}
                    {profile.is_friend && user && friend.id !== user.id && (
                      <div className="absolute top-0 right-0 mt-1 mr-1">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === friend.id ? null : friend.id)}
                          className="p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                        >
                          <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </button>
                        {openDropdown === friend.id && (
                          <div ref={dropdownRef} className="absolute z-10 right-0 mt-2 w-28 bg-white border rounded shadow-lg">
                            <button
                              onClick={() => handleUnfriend(friend.id)}
                              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                            >
                              Unfriend
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <span className="text-gray-500">No friends to show.</span>
            )}
          </div>
        </div>
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
      </div>
    </div>
  );
};

export default UserProfilePage; 
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/application/context/AuthContext";
import { Profile } from "../../../core/domain/entities/Profile.entity";
import { profileRepository } from '../../../infrastructure/repositories/ProfileRepository';
import MainLayout from "../../components/MainLayout";
import { friendRepository } from '../../../infrastructure/repositories/FriendRepository';
import { postRepository } from '../../../infrastructure/repositories/PostRepository';
import Spinner from "../../ui/Spinner";
import { getCoverUrl, getImageUrl } from '../../../utils/getImageUrl';
import PostStoryMedia from "../../components/PostStoryMedia";
import UserListItem from "../../components/UserListItem";
import { useFriendContext } from "../../../core/application/context/FriendContext";
import { useProfile } from "../../../core/application/context/ProfileContext";
import LikeButton from "../../components/LikeButton";
import OptionsMenu, { isOwnedBy } from "../../components/OptionsMenu";
import { useConfirm } from "../../components/useConfirm";
import { useChatContext } from "../../../core/application/context/ChatContext";
import { refersTo } from "../../../utils/friendStatus";
import { saveVisitedProfile } from "../../../utils/searchHistory";
import { postStoryLine, visibilityLabel } from "../../../utils/postStory";


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
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following' | 'friends'>('posts');
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const { unfriend } = useFriendContext();
  const { profile: authProfile } = useProfile();
  const { openChatWithUser } = useChatContext();
  const { confirm, modal } = useConfirm();
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");

  const personRef = { id, user: profile?.user, profile_id: profile?.id };
  const receivedRequestFromUser = receivedRequests.find((r: any) => refersTo(r.from_user, personRef))
    || (profile?.friend_request_received && profile.friend_request_id
      ? { id: profile.friend_request_id }
      : null);
  const sentRequestToUser = sentRequests.find((r: any) => refersTo(r.to_user, personRef))
    || (profile?.friend_request_sent && profile.friend_request_id
      ? { id: profile.friend_request_id }
      : null);
  const isFriend = Boolean(profile?.is_friend);

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
        if (res && user && String(res.user?.id) !== String(user.id) && String(res.id) !== String(user.profile?.id)) {
          saveVisitedProfile({
            id: String(res.user?.id || res.id),
            username: res.username || "User",
            firstname: (res.user as any)?.firstname,
            lastname: (res.user as any)?.lastname,
            profile_picture: res.profile_picture,
          });
        }
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
        const sentReq = sent.find((r: any) =>
          String(r.to_user?.user?.id || r.to_user?.id) === String(id)
        );
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

  const handleLike = async (postId: string) => {
    const updated = await postRepository.toggleLikePost(postId);
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, likes: updated.likes, is_liked: updated.is_liked }
          : post
      )
    );
  };

  const handleComment = async (postId: string) => {
    if (!commentText.trim()) return;
    const newComment = await postRepository.commentOnPost(postId, commentText);
    setCommentText("");
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, comments: [...(post.comments || []), newComment] }
          : post
      )
    );
  };

  const handleSaveComment = async (commentId: string) => {
    if (!editedComment.trim()) return;
    const updated = await postRepository.updateComment(commentId, editedComment);
    setEditingCommentId(null);
    setEditedComment("");
    setPosts((prev) =>
      prev.map((post) => ({
        ...post,
        comments: (post.comments || []).map((comment: any) =>
          comment.id === commentId ? { ...comment, ...updated } : comment
        ),
      }))
    );
  };

  const handleDeleteComment = async (commentId: string) => {
    const ok = await confirm({
      title: "Delete comment",
      message: "Are you sure you want to delete this comment?",
    });
    if (!ok) return;
    await postRepository.deleteComment(commentId);
    setPosts((prev) =>
      prev.map((post) => ({
        ...post,
        comments: (post.comments || []).filter((comment: any) => comment.id !== commentId),
      }))
    );
  };

  const handleSendFriendRequest = async () => {
    if (!profile?.user?.id) return;
    try {
      const created = await friendRepository.sendFriendRequest(String(profile.user.id));
      setSentRequests((requests) =>
        requests.some((request) => String(request.id) === String(created.id))
          ? requests
          : [...requests, created]
      );
      setFriendRequestId(String(created.id));
      setProfile((current) => current
        ? { ...current, friend_request_sent: true, friend_request_id: String(created.id) }
        : current);
    } catch (err: any) {
      const message = String(err?.response?.data?.error || err?.message || "");
      if (message.toLowerCase().includes("already sent")) {
        const sent = await friendRepository.listSentFriendRequests();
        setSentRequests(sent);
        const sentReq = sent.find((r: any) => refersTo(r.to_user, personRef));
        setFriendRequestId(sentReq ? String(sentReq.id) : null);
        setProfile((current) => current
          ? { ...current, friend_request_sent: true, friend_request_id: sentReq ? String(sentReq.id) : current.friend_request_id }
          : current);
      }
    }
  };

  const handleCancelFriendRequest = async () => {
    const request = sentRequestToUser;
    if (!request) return;
    setSentRequests((requests) => requests.filter((r: any) => String(r.id) !== String(request.id)));
    setFriendRequestId(null);
    setProfile((current) => current
      ? { ...current, friend_request_sent: false, friend_request_id: null }
      : current);
    try {
      await friendRepository.cancelFriendRequest(request.id);
    } catch {
      setSentRequests((requests) => [...requests, request]);
      setFriendRequestId(String(request.id));
      setProfile((current) => current
        ? { ...current, friend_request_sent: true, friend_request_id: String(request.id) }
        : current);
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

  if (loading) {
    return (
      <MainLayout>
        <div className="wb-page"><Spinner /></div>
      </MainLayout>
    );
  }
  if (!profile) {
    return (
      <MainLayout>
        <div className="wb-page"><div className="wb-empty">Profile not found.</div></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {modal}
      <div className="wb-page !px-0 !py-0">
        <div className="mx-auto w-full max-w-4xl overflow-hidden bg-white shadow-card md:rounded-b-xl">
        <div className="relative h-48 w-full bg-gray-300 sm:h-64 md:h-72">
          {getCoverUrl(profile.cover_photo) && (
            <img
              src={getCoverUrl(profile.cover_photo)!}
              alt="Cover"
              className="h-full w-full object-cover object-center"
            />
          )}
          <div className="absolute left-6 bottom-[-48px] sm:left-8 sm:bottom-[-64px]">
            <img
              src={getImageUrl(profile.profile_picture)}
              alt="Profile"
              className={`h-24 w-24 rounded-full border-4 border-white bg-gray-200 shadow-lg sm:h-32 sm:w-32 md:h-36 md:w-36 ${profile.profile_picture ? "object-cover" : "object-contain p-5 sm:p-7"}`}
            />
          </div>
        </div>
        
        <div className="mt-16 flex flex-col justify-between gap-4 px-4 sm:flex-row sm:items-end sm:px-8">
          <div>
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            {profile.bio && <p className="mt-1 text-sm text-wb-muted">{profile.bio}</p>}
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {user && String(user.id) !== String(id) && (
              <div className="flex flex-wrap gap-2">
                {isFriend ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowFollowDropdown((v) => !v)}
                      className="wb-btn-secondary"
                    >
                      Friends
                    </button>
                    {showFollowDropdown && (
                      <div className="absolute right-0 z-10 mt-2 min-w-[140px] overflow-hidden rounded-xl border border-wb-line bg-white shadow-card">
                        {following ? (
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-wb-canvas"
                            onClick={() => { handleUnfollow(); setShowFollowDropdown(false); }}
                          >
                            Unfollow
                          </button>
                        ) : (
                          <button
                            className="block w-full px-4 py-2 text-left text-sm hover:bg-wb-canvas"
                            onClick={() => { handleFollow(); setShowFollowDropdown(false); }}
                          >
                            Follow
                          </button>
                        )}
                        <button
                          className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-wb-canvas"
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
                      className="wb-btn-primary"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        await friendRepository.rejectFriendRequest(receivedRequestFromUser.id);
                        setReceivedRequests(requests => requests.filter((r: any) => r.id !== receivedRequestFromUser.id));
                        await refreshData();
                      }}
                      className="wb-btn-secondary"
                    >
                      Decline
                    </button>
                  </>
                ) : sentRequestToUser ? (
                  <>
                    <span className="text-sm text-wb-muted">Request sent</span>
                    <button
                      onClick={() => handleCancelFriendRequest()}
                      className="wb-btn-secondary"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSendFriendRequest}
                    className="wb-btn-primary"
                  >
                    Add friend
                  </button>
                )}
                <button
                  className="wb-btn-secondary"
                  onClick={() => openChatWithUser(String(profile.user?.id || id))}
                >
                  Message
                </button>
              </div>
            )}
            
          </div>
        </div>
        <div className="mt-6 flex gap-1 overflow-x-auto border-b border-wb-line px-2 sm:px-8">
          <button className={`px-4 py-3 text-sm font-semibold ${activeTab === 'posts' ? 'border-b-2 border-wb-blue text-wb-blue' : 'text-wb-muted'}`} onClick={() => setActiveTab('posts')}>Posts</button>
          <button className={`px-4 py-3 text-sm font-semibold ${activeTab === 'followers' ? 'border-b-2 border-wb-blue text-wb-blue' : 'text-wb-muted'}`} onClick={() => { setActiveTab('followers'); fetchFollowersList(); }}>Followers</button>
          <button className={`px-4 py-3 text-sm font-semibold ${activeTab === 'following' ? 'border-b-2 border-wb-blue text-wb-blue' : 'text-wb-muted'}`} onClick={() => { setActiveTab('following'); fetchFollowingList(); }}>Following</button>
          <button className={`px-4 py-3 text-sm font-semibold ${activeTab === 'friends' ? 'border-b-2 border-wb-blue text-wb-blue' : 'text-wb-muted'}`} onClick={() => { setActiveTab('friends'); fetchFriendsList(); }}>Friends</button>
        </div>
        <div className="p-4 sm:p-6">
          {activeTab === 'posts' && (
            <div>
              {posts.length === 0 ? (
                <div className="wb-empty">No posts yet.</div>
              ) : (
              <div className="space-y-4">
              {posts.map((post) => (
                <article key={post.id} className="wb-card overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3">
                    <img
                      src={getImageUrl(post.profile?.profile_picture || profile.profile_picture)}
                      alt={post.profile?.username || profile.username}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{post.profile?.username || profile.username}</span>
                        {postStoryLine(post) && <span className="font-normal"> {postStoryLine(post)}</span>}
                      </p>
                      <p className="text-xs text-wb-muted">{visibilityLabel(post.visibility)}</p>
                    </div>
                  </div>
                  {post.content && <p className="px-4 pb-3 text-[15px]">{post.content}</p>}
                  <PostStoryMedia post={post} />
                  <div className="flex border-t border-wb-line px-2 py-1">
                    <LikeButton
                      liked={post.is_liked}
                      count={post.likes || 0}
                      onClick={() => handleLike(post.id)}
                    />
                    <button
                      onClick={() => setCommentingPostId(commentingPostId === post.id ? null : post.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-wb-muted hover:bg-wb-canvas"
                    >
                      Comment {post.comments?.length || 0}
                    </button>
                  </div>
                  {commentingPostId === post.id && (
                    <div className="border-t border-wb-line px-4 py-3">
                      <div className="mb-3 flex items-center gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="wb-input"
                          placeholder="Write a comment..."
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          className="wb-btn-primary"
                        >
                          Post
                        </button>
                      </div>
                      {post.comments?.length ? (
                        post.comments.map((comment: any) => (
                          <div key={comment.id} className="mb-3 flex items-start">
                            <img
                              src={getImageUrl(comment.profile?.profile_picture)}
                              alt=""
                              className="mr-2 h-7 w-7 shrink-0 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="rounded-2xl bg-wb-canvas px-3 py-2">
                                <p className="text-sm font-semibold">{comment.profile?.username}</p>
                                {editingCommentId === comment.id ? (
                                  <input
                                    type="text"
                                    value={editedComment}
                                    onChange={(e) => setEditedComment(e.target.value)}
                                    className="wb-input mt-1"
                                  />
                                ) : (
                                  <p className="text-sm text-wb-ink">{comment.comment}</p>
                                )}
                              </div>
                            </div>
                            {editingCommentId === comment.id ? (
                              <div className="ml-2 flex shrink-0 gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleSaveComment(comment.id)}
                                  className="text-xs font-bold text-wb-blue"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setEditingCommentId(null); setEditedComment(""); }}
                                  className="text-xs font-bold text-wb-muted"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : isOwnedBy(comment.profile?.user?.id, user?.id) ? (
                              <OptionsMenu
                                onEdit={() => {
                                  setEditingCommentId(comment.id);
                                  setEditedComment(comment.comment);
                                }}
                                onDelete={() => handleDeleteComment(comment.id)}
                              />
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-wb-muted">No comments yet.</p>
                      )}
                    </div>
                  )}
                </article>
              ))}
              </div>
              )}
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
          <div className="border-t border-wb-line p-4 sm:p-6">
            <h3 className="mb-3 text-lg font-bold">Friend requests</h3>
            <div className="space-y-2">
              {receivedRequests.map((req: any) => (
                <div key={req.id} className="flex items-center justify-between gap-2 rounded-xl border border-wb-line p-3">
                  <span className="font-semibold">{req.from_user.username}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await friendRepository.acceptFriendRequest(req.id);
                        setProfile(profile => profile ? { ...profile, is_friend: true } : profile);
                        setReceivedRequests(requests => requests.filter((r: any) => r.id !== req.id));
                      }}
                      className="wb-btn-primary"
                    >
                      Accept
                    </button>
                    <button
                      onClick={async () => {
                        await friendRepository.rejectFriendRequest(req.id);
                        setReceivedRequests(requests => requests.filter((r: any) => r.id !== req.id));
                      }}
                      className="wb-btn-secondary"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfilePage; 
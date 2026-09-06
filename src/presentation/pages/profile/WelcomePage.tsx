import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, ImagePlus, Trash2, X } from "lucide-react";
import { useAuth } from "../../../core/application/context/AuthContext";
import { useProfile } from "../../../core/application/context/ProfileContext";

import { authRepository } from '../../../infrastructure/repositories/AuthRepository';
import Spinner from "../../ui/Spinner";

import { usePostContext } from "../../../core/application/context/PostContext";


import { profileRepository } from '../../../infrastructure/repositories/ProfileRepository';
import { ERRORS } from "../../../constants/errors";
import FullScreenPostModal from "../modal/FullScreenPostModal";
import EditPostModal from "../modal/EditPostModal";
import { Post } from "../../../core/domain/entities/Post";
import MainLayout from "../../components/MainLayout";
import { getCoverUrl, getImageUrl } from "../../../utils/getImageUrl";
import UserListItem from "../../components/UserListItem";
import { useFriendContext } from "../../../core/application/context/FriendContext";
import LikeButton from "../../components/LikeButton";
import { useConfirm } from "../../components/useConfirm";
import OptionsMenu, { isOwnedBy } from "../../components/OptionsMenu";
import ProcessProgressBox from "../../components/ProcessProgressBox";
import PostStoryMedia from "../../components/PostStoryMedia";
import { runTimedProgress } from "../../../utils/runTimedProgress";
import { postStoryLine, visibilityLabel } from "../../../utils/postStory";


export const WelcomePage = () => {
  const { isAuthenticated, isAuthLoading, logout, user } = useAuth();
  const { profile, fetchProfile, updateProfile, uploadProfilePicture, deleteAccount, uploadCoverPhoto, removeProfilePicture, removeCoverPhoto } = useProfile();
  const [editMode, setEditMode] = useState<"username" | "profile_picture" | "bio" | "gender" | null>(null);
  const [updatedUsername, setUpdatedUsername] = useState("");
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState<File | null>(null);
  const [updatedBio, setUpdatedBio] = useState("");
  const [updatedGender, setUpdatedGender] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { posts, likepost, commentOnPost, getComments, updateComment, deleteComment, deletePost, fetchPosts } = usePostContext();
  const [openCommentSectionId, setOpenCommentSectionId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
 
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following' | 'friends'>('posts');
  const [friendsList, setFriendsList] = useState<any[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [process, setProcess] = useState<{ label: string; percent: number } | null>(null);
  const [showPicOptions, setShowPicOptions] = useState<null | 'profile' | 'cover'>(null);
  const [viewPicModal, setViewPicModal] = useState<null | 'profile' | 'cover'>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadKindRef = useRef<'profile' | 'cover'>('profile');
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const { unfriend } = useFriendContext();
  const { confirm, modal } = useConfirm();
  
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) return;
    setLoading(true);
    fetchProfile().finally(() => setLoading(false));
  }, [isAuthLoading, isAuthenticated]);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      let updatedData: any = {};
      switch (editMode) {
        case "username":
          updatedData = { username: updatedUsername };
          break;
        case "profile_picture":
          if (updatedProfilePicture) {
            await runPhotoUpload("Uploading profile picture", () => uploadProfilePicture(updatedProfilePicture));
          }
          return;
        case "bio":
          updatedData = { bio: updatedBio };
          break;
        case "gender":
          updatedData = { "user[gender]": updatedGender };
          break;
        default:
          return;
      }
      await updateProfile(updatedData);
      await fetchProfile();
      setEditMode(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const ok = await confirm({
      title: "Delete account",
      message: "Are you sure you want to delete your account? This action cannot be undone.",
      confirmLabel: "Delete account",
    });
    if (!ok) return;
    await deleteAccount();
    logout();
    navigate("/login");
  };

  const handleChangePassword = async () => {
    setPasswordMessage(null);
    setPasswordError(null);
    try {
      const res = await authRepository.changePassword(oldPassword, newPassword, confirmPassword);
      setPasswordMessage(res.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || ERRORS.auth.changePasswordFailed);
    }
  };

  const userPosts = posts.filter(post => post.profile?.user?.id === user?.id);


  const fetchComments = async (postId: string) => {
    try {
      const comments = await getComments(postId);
      setComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Handle comment section open/close
  const handleOpenComments = (postId: string) => {
    if (openCommentSectionId === postId) {
      setOpenCommentSectionId(null);
      setComments([]);
    } else {
      setOpenCommentSectionId(postId);
      fetchComments(postId);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (postId: string) => {
    if (newComment.trim()) {
      await commentOnPost(postId, newComment);
      setNewComment("");
      fetchComments(postId);
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId: string) => {
    if (editedComment.trim()) {
      await updateComment(commentId, editedComment);
      setEditingCommentId(null);
      setEditedComment("");
      if (openCommentSectionId) fetchComments(openCommentSectionId);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    const ok = await confirm({
      title: "Delete comment",
      message: "Are you sure you want to delete this comment?",
    });
    if (!ok) return;
    await deleteComment(commentId);
    if (openCommentSectionId) fetchComments(openCommentSectionId);
  };

  const fetchFollowersList = async () => {
    setLoadingFollowers(true);
    try {
      const followers = await profileRepository.getFollowers(profile!.id);
      setFollowersList(followers);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const fetchFollowingList = async () => {
    setLoadingFollowing(true);
    try {
      const following = await profileRepository.getFollowing(profile!.id);
      setFollowingList(following);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const fetchFriendsList = async () => {
    setLoadingFriends(true);
    try {
      const friends = await profileRepository.getFriends();
      setFriendsList(friends);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleFollow = async (userId: number) => {
    await profileRepository.followUser(userId);
    fetchFollowingList();
  };

  const handleUnfollow = async (userId: number) => {
    await profileRepository.unfollowUser(userId);
    fetchFollowingList();
  };

  const handleUnfriend = async (userId: number) => {
    await unfriend(userId);
    fetchFriendsList();
  };

  const startUpload = (kind: "profile" | "cover") => {
    uploadKindRef.current = kind;
    setShowPicOptions(null);
    fileInputRef.current?.click();
  };

  const runPhotoUpload = async (label: string, upload: () => Promise<void>) => {
    setProcess({ label, percent: 1 });
    try {
      await Promise.all([
        upload(),
        runTimedProgress(5000, (percent) => {
          setProcess((current) => (current ? { ...current, percent } : current));
        }),
      ]);
      setProcess({ label, percent: 100 });
      await Promise.all([fetchProfile(), fetchPosts()]);
      await new Promise((resolve) => window.setTimeout(resolve, 350));
    } catch (error) {
      await confirm({
        title: "Upload failed",
        message: error instanceof Error ? error.message : ERRORS.profile.uploadPictureFailed,
        confirmLabel: "OK",
        cancelLabel: "Close",
      });
    } finally {
      setProcess(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const isProfile = uploadKindRef.current === "profile";
    await runPhotoUpload(
      isProfile ? "Uploading profile picture" : "Uploading cover photo",
      () => (isProfile ? uploadProfilePicture(file) : uploadCoverPhoto(file))
    );
    e.target.value = "";
  };

  const handleRemove = async (kind: "profile" | "cover") => {
    const ok = await confirm({
      title: kind === "profile" ? "Remove profile picture" : "Remove cover photo",
      message: "This photo will be removed from your profile.",
      confirmLabel: "Remove",
    });
    if (!ok) return;
    if (kind === "profile") await removeProfilePicture();
    else await removeCoverPhoto();
    await fetchProfile();
    setShowPicOptions(null);
  };

  const openPhoto = (kind: "profile" | "cover") => {
    const hasPhoto = kind === "profile" ? Boolean(profile?.profile_picture) : Boolean(getCoverUrl(profile?.cover_photo));
    if (!hasPhoto) {
      startUpload(kind);
      return;
    }
    setShowPicOptions(null);
    setViewPicModal(kind);
  };

  const handleDeletePost = async (id: string) => {
    const ok = await confirm({
      title: "Delete post",
      message: "Are you sure you want to delete this post? This cannot be undone.",
    });
    if (!ok) return;
    await deletePost(id);
    await fetchProfile();
  };

  const handleReplySubmit = async (postId: string, parentId: string) => {
    if (replyText.trim()) {
      await commentOnPost(postId, replyText, parentId);
      setReplyText("");
      setReplyToCommentId(null);
      fetchComments(postId);
    }
  };

  const renderComments = (commentsList: any[], postId: string, isReply = false) =>
    [...commentsList].reverse().map((comment) => (
      <div key={comment.id} className={`mb-3 flex items-start justify-between ${isReply ? "ml-10" : ""}`}>
        <div className="flex min-w-0 items-start">
          <img
            src={getImageUrl(comment.profile?.profile_picture)}
            alt={comment.profile?.username}
            className="mr-2 h-7 w-7 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
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
            <button
              onClick={() => setReplyToCommentId(comment.id)}
              className="mt-1 text-xs font-semibold text-wb-muted hover:text-wb-blue"
            >
              Reply
            </button>
            {replyToCommentId === comment.id && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="wb-input"
                />
                <button
                  onClick={() => handleReplySubmit(postId, comment.id)}
                  className="wb-btn-primary"
                >
                  Reply
                </button>
              </div>
            )}
            {!isReply && comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {renderComments(comment.replies, postId, true)}
              </div>
            )}
          </div>
        </div>
        {editingCommentId === comment.id ? (
          <div className="ml-2 flex shrink-0 gap-2">
            <button onClick={() => handleEditComment(comment.id)} className="text-xs font-bold text-wb-blue">
              Save
            </button>
            <button
              onClick={() => { setEditingCommentId(null); setEditedComment(""); }}
              className="text-xs font-bold text-wb-muted"
            >
              Cancel
            </button>
          </div>
        ) : isOwnedBy(comment.profile?.user?.id, user?.id) ? (
          <OptionsMenu
            onEdit={() => { setEditingCommentId(comment.id); setEditedComment(comment.comment); }}
            onDelete={() => handleDeleteComment(comment.id)}
          />
        ) : null}
      </div>
    ));

  if (!isAuthenticated) {
    return null; 
  }

  if (loading) return <Spinner />;

  return (
    <MainLayout>
      {modal}
      {process && <ProcessProgressBox label={process.label} percent={process.percent} />}
      <div className="wb-page !px-0 !py-0">
        <div className="mx-auto w-full max-w-4xl">
          <div className="relative bg-white shadow-card md:overflow-hidden md:rounded-b-xl">
            {/* Settings Icon */}
            <button
              className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 text-wb-ink shadow-card hover:bg-white"
              onClick={() => setShowSettings(true)}
              aria-label="Open settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 sm:w-7 sm:h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.149c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            {profile && (
              <div>
                <div className="relative h-48 w-full bg-gray-300 sm:h-64 md:h-72">
                  <button
                    type="button"
                    className="h-full w-full"
                    onClick={() => openPhoto("cover")}
                    aria-label="View cover photo"
                  >
                    {getCoverUrl(profile.cover_photo) && (
                      <img
                        src={getCoverUrl(profile.cover_photo)!}
                        alt="Cover"
                        className="h-full w-full object-cover object-center"
                      />
                    )}
                  </button>
                  <div className="absolute bottom-3 right-3">
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-wb-ink shadow-card hover:bg-wb-canvas"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowPicOptions((current) => (current === "cover" ? null : "cover"));
                      }}
                      aria-label="Edit cover photo"
                    >
                      <Camera size={18} />
                    </button>
                    {showPicOptions === "cover" && (
                      <div className="absolute right-0 top-11 z-30 w-48 overflow-hidden rounded-xl border border-wb-line bg-white shadow-card">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold hover:bg-wb-canvas"
                          onClick={() => startUpload("cover")}
                        >
                          <ImagePlus size={16} /> Upload photo
                        </button>
                        {getCoverUrl(profile.cover_photo) && (
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-wb-canvas"
                            onClick={() => handleRemove("cover")}
                          >
                            <Trash2 size={16} /> Remove
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-[-48px] left-6 sm:bottom-[-64px] sm:left-8">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openPhoto("profile");
                        }}
                        aria-label="View profile picture"
                      >
                        <img
                          src={getImageUrl(profile.profile_picture)}
                          alt="Profile"
                          className={`h-24 w-24 rounded-full border-4 border-white bg-gray-200 shadow-lg sm:h-32 sm:w-32 md:h-36 md:w-36 ${profile.profile_picture ? "object-cover" : "object-contain p-5 sm:p-7"}`}
                        />
                      </button>
                      <button
                        type="button"
                        className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border border-wb-line bg-white text-wb-ink shadow-card hover:bg-wb-canvas sm:h-9 sm:w-9"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPicOptions((current) => (current === "profile" ? null : "profile"));
                        }}
                        aria-label="Edit profile picture"
                      >
                        <Camera size={16} />
                      </button>
                      {showPicOptions === "profile" && (
                        <div className="absolute left-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-wb-line bg-white shadow-card">
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold hover:bg-wb-canvas"
                            onClick={() => startUpload("profile")}
                          >
                            <ImagePlus size={16} /> Upload photo
                          </button>
                          {profile.profile_picture && (
                            <button
                              type="button"
                              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-red-500 hover:bg-wb-canvas"
                              onClick={() => handleRemove("profile")}
                            >
                              <Trash2 size={16} /> Remove
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleUpload} />
                <div className="mt-16 px-4 pb-2 sm:px-8">
                  <h1 className="text-2xl font-bold">{profile.username}</h1>
                  {profile.bio && <p className="mt-1 text-sm text-wb-muted">{profile.bio}</p>}
                </div>
                <div className="mt-4 flex gap-1 overflow-x-auto border-b border-wb-line px-2 sm:px-8">
                  <button className={`px-4 py-3 text-sm font-semibold ${activeTab === 'posts' ? 'border-b-2 border-wb-blue text-wb-blue' : 'text-wb-muted'}`} onClick={() => setActiveTab('posts')}>Posts</button>
                  <button className={`px-4 py-3 text-sm font-semibold ${activeTab === 'followers' ? 'border-b-2 border-wb-blue text-wb-blue' : 'text-wb-muted'}`} onClick={() => { setActiveTab('followers'); fetchFollowersList(); }}>Followers</button>
                  <button className={`px-4 py-3 text-sm font-semibold ${activeTab === 'following' ? 'border-b-2 border-wb-blue text-wb-blue' : 'text-wb-muted'}`} onClick={() => { setActiveTab('following'); fetchFollowingList(); }}>Following</button>
                  <button className={`px-4 py-3 text-sm font-semibold ${activeTab === 'friends' ? 'border-b-2 border-wb-blue text-wb-blue' : 'text-wb-muted'}`} onClick={() => { setActiveTab('friends'); fetchFriendsList(); }}>Friends</button>
                </div>
                {activeTab === 'posts' && (
                  <div className="p-4 sm:p-6">
                    {userPosts.length === 0 ? (
                      <div className="wb-empty">No posts yet.</div>
                    ) : (
                      <div className="space-y-4">
                        {userPosts.map((post) => (
                          <div key={post.id} className="wb-card overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-3">
                              <img
                                src={getImageUrl(post.profile.profile_picture)}
                                alt={post.profile.username}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm">
                                  <span className="font-semibold">{post.profile.username}</span>
                                  {postStoryLine(post) && (
                                    <span className="font-normal"> {postStoryLine(post)}</span>
                                  )}
                                </p>
                                <p className="text-xs text-wb-muted">{visibilityLabel(post.visibility)}</p>
                              </div>
                              {isOwnedBy(post.profile?.user?.id, user?.id) && (
                                <OptionsMenu
                                  onEdit={() => setEditingPost(post)}
                                  onDelete={() => handleDeletePost(post.id)}
                                />
                              )}
                            </div>
                            {post.content && <p className="px-4 pb-3 text-[15px]">{post.content}</p>}
                            <PostStoryMedia post={post} />
                            <div className="flex border-t border-wb-line px-2 py-1">
                              <LikeButton
                                liked={post.is_liked}
                                count={post.likes || 0}
                                onClick={(e) => { e.stopPropagation(); likepost(post.id); }}
                              />
                              <button
                                onClick={e => { e.stopPropagation(); handleOpenComments(post.id); }}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-wb-muted hover:bg-wb-canvas"
                              >
                                Comment {post.comments?.length || 0}
                              </button>
                            </div>
                            {openCommentSectionId === post.id && (
                              <div className="border-t border-wb-line px-4 py-3">
                                <div className="mb-3 flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Write a comment..."
                                    className="wb-input"
                                  />
                                  <button
                                    onClick={() => handleCommentSubmit(post.id)}
                                    className="wb-btn-primary"
                                  >
                                    Post
                                  </button>
                                </div>
                                {/* Render comments and replies recursively */}
                                {renderComments(comments, post.id)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'followers' && (
                  <div className="p-4 sm:p-6">
                    {loadingFollowers ? <Spinner /> : (
                      <ul className="space-y-4">
                        {followersList.filter(f => f.id !== profile?.id).length === 0 ? <li>No followers yet.</li> : followersList.filter(f => f.id !== profile?.id).map(f => (
                          <UserListItem key={f.id} user={f} type="followers" onFollow={handleFollow} authenticatedProfileId={profile?.id} />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {activeTab === 'following' && (
                  <div className="p-4 sm:p-6">
                    {loadingFollowing ? <Spinner /> : (
                      <ul className="space-y-4">
                        {followingList.filter(f => f.id !== profile?.id).length === 0 ? <li>Not following anyone yet.</li> : followingList.filter(f => f.id !== profile?.id).map(f => (
                          <UserListItem key={f.id} user={f} type="following" onUnfollow={handleUnfollow} authenticatedProfileId={profile?.id} />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {activeTab === 'friends' && (
                  <div className="p-4 sm:p-6">
                    {loadingFriends ? <Spinner /> : (
                      <ul className="space-y-4">
                        {friendsList.filter(f => f.id !== profile?.id).length === 0 ? <li>No friends yet.</li> : friendsList.filter(f => f.id !== profile?.id).map(f => (
                          <UserListItem key={f.id} user={f} type="friends" onUnfriend={handleUnfriend} authenticatedProfileId={profile?.id} />
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {/* Modals for settings, followers, following, profile pic, and full post */}
                {showSettings && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-md relative">
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowSettings(false)}
                        aria-label="Close settings"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Account Center</h2>
                      <div className="mb-4 flex flex-col items-center">
                        <img
                          src={getImageUrl(profile?.profile_picture)}
                          alt="Profile"
                          className="mb-2 h-24 w-24 rounded-full border bg-gray-200 object-cover"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setShowProfilePicModal(true)} className="text-xs underline flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12C2.25 12 5.25 5.25 12 5.25s9.75 6.75 9.75 6.75-3 6.75-9.75 6.75S2.25 12 2.25 12z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                            </svg>
                            View
                          </button>
                          <button onClick={() => setEditMode('profile_picture')} className="text-xs underline flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113.02 2.92L7.5 19.793l-4 1 1-4 12.362-12.306z" />
                            </svg>
                            Change
                          </button>
                        </div>
                        {editMode === 'profile_picture' && (
                          <div className="w-full mt-4 space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setUpdatedProfilePicture(e.target.files[0]);
                                }
                              }}
                              className="w-full p-2 border rounded"
                            />
                            <div className="flex space-x-4">
                              <button
                                onClick={handleUpdateProfile}
                                className="border rounded px-4 py-2"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditMode(null)}
                                className="border rounded px-4 py-2"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Username:</span>
                          {editMode === 'username' ? (
                            <>
                              <input
                                type="text"
                                value={updatedUsername}
                                onChange={(e) => setUpdatedUsername(e.target.value)}
                                placeholder="Enter new username"
                                className="w-1/2 p-1 border rounded ml-2"
                              />
                              <button onClick={handleUpdateProfile} className="ml-2 border rounded px-2 py-1">Save</button>
                              <button onClick={() => setEditMode(null)} className="ml-2 border rounded px-2 py-1">Cancel</button>
                            </>
                          ) : (
                            <>
                              <span>{profile?.username}</span>
                              <button onClick={() => { setEditMode('username'); setUpdatedUsername(profile?.username || ''); }} className="ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113.02 2.92L7.5 19.793l-4 1 1-4 12.362-12.306z" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Bio:</span>
                          {editMode === 'bio' ? (
                            <>
                              <textarea
                                value={updatedBio}
                                onChange={(e) => setUpdatedBio(e.target.value)}
                                placeholder="Enter new bio"
                                className="w-1/2 p-1 border rounded ml-2"
                              />
                              <button onClick={handleUpdateProfile} className="ml-2 border rounded px-2 py-1">Save</button>
                              <button onClick={() => setEditMode(null)} className="ml-2 border rounded px-2 py-1">Cancel</button>
                            </>
                          ) : (
                            <>
                              <span>{profile?.bio}</span>
                              <button onClick={() => { setEditMode('bio'); setUpdatedBio(profile?.bio || ''); }} className="ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113.02 2.92L7.5 19.793l-4 1 1-4 12.362-12.306z" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Gender:</span>
                          {editMode === 'gender' ? (
                            <>
                              <select
                                value={updatedGender}
                                onChange={(e) => setUpdatedGender(e.target.value)}
                                className="w-1/2 p-1 border rounded ml-2"
                              >
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                              <button onClick={handleUpdateProfile} className="ml-2 border rounded px-2 py-1">Save</button>
                              <button onClick={() => setEditMode(null)} className="ml-2 border rounded px-2 py-1">Cancel</button>
                            </>
                          ) : (
                            <>
                              <span>{profile?.user.gender}</span>
                              <button onClick={() => { setEditMode('gender'); setUpdatedGender(profile?.user.gender || ''); }} className="ml-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.1 2.1 0 113.02 2.92L7.5 19.793l-4 1 1-4 12.362-12.306z" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Email:</span> {profile?.user.email}
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">Date of Birth:</span> {profile?.user.birthday}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button onClick={() => { setShowPasswordModal(true); setShowSettings(false); }} className="wb-btn-primary">Change password</button>
                        <button onClick={logout} className="wb-btn-secondary">Logout</button>
                        <button onClick={handleDeleteAccount} className="wb-btn-danger">Delete account</button>
                      </div>
                    </div>
                  </div>
                )}
                {showPasswordModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-md relative">
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPasswordModal(false)}
                        aria-label="Close change password"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <h3 className="text-lg sm:text-xl font-semibold mb-2">Change Password</h3>
                      <input
                        type="password"
                        placeholder="Old Password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="wb-input mb-2"
                      />
                      <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="wb-input mb-2"
                      />
                      <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="wb-input mb-2"
                      />
                      <div className="flex space-x-4 mt-2">
                        <button
                          onClick={handleChangePassword}
                          className="wb-btn-primary"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setShowPasswordModal(false)}
                          className="wb-btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                      {passwordMessage && <p className="text-green-600 mt-2 text-xs sm:text-sm">{passwordMessage}</p>}
                      {passwordError && <p className="text-red-600 mt-2 text-xs sm:text-sm">{passwordError}</p>}
                    </div>
                  </div>
                )}
                {showProfilePicModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8 relative flex flex-col items-center">
                      <button className="absolute top-2 right-2" onClick={() => setShowProfilePicModal(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <img
                        src={getImageUrl(profile?.profile_picture)}
                        alt="Profile Zoom"
                        className="w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 rounded-full object-cover border"
                      />
                    </div>
                  </div>
                )}
                {selectedPost && (
                  <FullScreenPostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
                )}
                {editingPost && (
                  <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} />
                )}
                {showPicOptions && (
                  <button
                    type="button"
                    className="fixed inset-0 z-20 cursor-default"
                    aria-label="Close photo menu"
                    onClick={() => setShowPicOptions(null)}
                  />
                )}
                {viewPicModal && (
                  <div
                    className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setViewPicModal(null)}
                  >
                    <button
                      type="button"
                      className="absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
                      onClick={() => setViewPicModal(null)}
                      aria-label="Close"
                    >
                      <X size={22} />
                    </button>
                    {viewPicModal === "cover" && !getCoverUrl(profile.cover_photo) ? (
                      <div className="h-64 w-full max-w-3xl rounded-lg bg-gray-300" />
                    ) : (
                      <img
                        src={viewPicModal === "profile"
                          ? getImageUrl(profile.profile_picture)
                          : getCoverUrl(profile.cover_photo)!}
                        alt={viewPicModal === "profile" ? "Profile" : "Cover"}
                        className="max-h-[85vh] max-w-full object-contain"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
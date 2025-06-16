import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/application/context/AuthContext";
import { useProfile } from "../../../core/application/context/ProfileContext";

import { authRepository } from '../../../infrastructure/repositories/AuthRepository';
import Spinner from "../../ui/Spinner";

import { usePostContext } from "../../../core/application/context/PostContext";

import { Modal } from '../../pages/modal/modal';
import { profileRepository } from '../../../infrastructure/repositories/ProfileRepository';
import FullScreenPostModal from "../modal/FullScreenPostModal";
import { Post } from "../../../core/domain/entities/Post";


const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const WelcomePage = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { profile, fetchProfile, updateProfile, uploadProfilePicture, deleteAccount } = useProfile();
  const [editMode, setEditMode] = useState<"username" | "profile_picture" | "bio" | "gender" | null>(null);
  const [updatedUsername, setUpdatedUsername] = useState("");
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState<File | null>(null);
  const [updatedBio, setUpdatedBio] = useState("");
  const [updatedGender, setUpdatedGender] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { posts, likepost, commentOnPost, getComments, updateComment, deleteComment } = usePostContext();
  const [openCommentSectionId, setOpenCommentSectionId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      setLoading(true);
      fetchProfile().finally(() => setLoading(false));
    }
  }, []);

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
            await uploadProfilePicture(updatedProfilePicture);
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
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      await deleteAccount();
      logout();
      navigate("/login");
    }
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
      setShowPasswordForm(false);
    } catch (err: any) {
      setPasswordError(err?.response?.data?.error || "Failed to change password");
    }
  };

  // Filter posts to only those by the authenticated user
  const userPosts = posts.filter(post => post.profile?.user?.id === user?.id);

  // Fetch comments for a post
  const fetchComments = async (postId: number) => {
    try {
      const comments = await getComments(postId);
      setComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Handle comment section open/close
  const handleOpenComments = (postId: number) => {
    if (openCommentSectionId === postId) {
      setOpenCommentSectionId(null);
      setComments([]);
    } else {
      setOpenCommentSectionId(postId);
      fetchComments(postId);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (postId: number) => {
    if (newComment.trim()) {
      await commentOnPost(postId, newComment);
      setNewComment("");
      fetchComments(postId);
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId: number) => {
    if (editedComment.trim()) {
      await updateComment(commentId, editedComment);
      setEditingCommentId(null);
      setEditedComment("");
      if (openCommentSectionId) fetchComments(openCommentSectionId);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteComment(commentId);
      if (openCommentSectionId) fetchComments(openCommentSectionId);
    }
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

  if (!isAuthenticated) {
    return null; 
  }

  if (loading) return <Spinner />;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg relative">
        {/* Settings Icon */}
        <button
          className="absolute top-6 right-6 focus:outline-none"
          onClick={() => setShowSettings(true)}
          aria-label="Open settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.149c-.542-.09-.94-.56-.94-1.11v-1.094c0-.55.398-1.019.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <h1 className="text-2xl text-center mb-6">Demo of utsav's project!</h1>
        {profile && (
          <div className="space-y-10">
            {/* Profile Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-8 mb-8 relative">
              {/* Profile Picture and Bio */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <img
                  src={`${BACKEND_BASE_URL}${profile.profile_picture}`}
                  alt="Profile"
                  className="w-36 h-36 rounded-full object-cover bg-gray-200 border-4 border-blue-500"
                />
                <span className="mt-2 text-lg text-gray-500">Profile picture</span>
                <span className="mt-2 text-base text-gray-700">{profile.bio}</span>
              </div>
              {/* Stats, Username, Gender */}
              <div className="flex-1 flex flex-col items-center sm:items-start justify-center gap-2 mt-6 sm:mt-0">
                <div className="text-2xl font-bold text-gray-800 mt-2">{profile.username}</div>
                <div className="text-base text-gray-700 mb-2">{profile.user.gender}</div>
                <div className="flex flex-row gap-8 mb-2 text-lg sm:text-xl font-medium text-gray-800">
                  <span>{profile.total_posts} Posts</span>
                  <span className="cursor-pointer hover:underline" onClick={() => { fetchFollowersList(); setShowFollowersModal(true); }}>check Followers</span>
                  <span className="cursor-pointer hover:underline" onClick={() => { fetchFollowingList(); setShowFollowingModal(true); }}>check Following</span>
                </div>
              </div>
              {/* Settings Icon (already in top right) */}
            </div>
            {/* Posts Section */}
            <div className="mt-2">
              <h3 className="text-xl font-semibold mb-4">Posts</h3>
              {userPosts.length === 0 ? (
                <div className="bg-gray-100 rounded-lg p-8 text-center text-gray-500">No posts yet.</div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {userPosts.map((post) => (
                    <div key={post.id} className="bg-gray-200 rounded-lg p-6 flex flex-col gap-4 cursor-pointer hover:bg-gray-300 transition" onClick={() => setSelectedPost(post)}>
                      <div className="flex items-center mb-2">
                        <img
                          src={`${BACKEND_BASE_URL}${post.profile.profile_picture}`}
                          alt={post.profile.username}
                          className="w-10 h-10 rounded-full mr-2"
                        />
                        <span className="font-bold">{post.profile.username}</span>
                      </div>
                      {post.content && <p className="mb-2">{post.content}</p>}
                      {post.image && (
                        <img
                          src={`${BACKEND_BASE_URL}${post.image}`}
                          alt="Post"
                          className="w-full h-48 object-cover rounded mb-2"
                        />
                      )}
                      <div className="flex space-x-4 mt-2">
                        <button onClick={e => { e.stopPropagation(); likepost(post.id); }} className="flex items-center">
                          <span>👍</span>
                          <span>{post.likes}</span>
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleOpenComments(post.id); }}
                          className="flex items-center"
                        >
                          <span>💬</span>
                          <span>{post.comments.length} comments</span>
                        </button>
                      </div>
                      {openCommentSectionId === post.id && (
                        <div className="mt-4">
                          <div className="flex items-center mb-4">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Write a comment..."
                              className="flex-grow p-2 border rounded"
                            />
                            <button
                              onClick={() => handleCommentSubmit(post.id)}
                              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
                            >
                              Post
                            </button>
                          </div>
                          {comments.map((comment) => (
                            <div key={comment.id} className="flex items-center mb-2">
                              <span className="font-semibold mr-2">{comment.profile?.username}:</span>
                              {editingCommentId === comment.id ? (
                                <>
                                  <input
                                    type="text"
                                    value={editedComment}
                                    onChange={(e) => setEditedComment(e.target.value)}
                                    className="border p-1 rounded w-2/3"
                                  />
                                  <button
                                    onClick={() => handleEditComment(comment.id)}
                                    className="ml-2 bg-green-500 text-white px-2 py-1 rounded"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingCommentId(null)}
                                    className="ml-2 bg-red-500 text-white px-2 py-1 rounded"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span>{comment.comment}</span>
                                  <button
                                    onClick={() => { setEditingCommentId(comment.id); setEditedComment(comment.comment); }}
                                    className="ml-2 text-blue-500 hover:underline text-xs"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="ml-2 text-red-500 hover:underline text-xs"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowSettings(false)}
                aria-label="Close settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">Account Center</h2>
              <div className="mb-4 flex flex-col items-center">
                <img
                  src={`${BACKEND_BASE_URL}${profile?.profile_picture}`}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border mb-2"
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
                <button onClick={handleDeleteAccount} className="border rounded px-4 py-2">Delete Account</button>
                <button onClick={logout} className="border rounded px-4 py-2">Logout</button>
                <button onClick={() => { setShowPasswordModal(true); setShowSettings(false); }} className="border rounded px-4 py-2">Change Password</button>
              </div>
            </div>
          </div>
        )}
        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPasswordModal(false)}
                aria-label="Close change password"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-lg font-semibold mb-2">Change Password</h3>
              <input
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={handleChangePassword}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
              {passwordMessage && <p className="text-green-600 mt-2">{passwordMessage}</p>}
              {passwordError && <p className="text-red-600 mt-2">{passwordError}</p>}
            </div>
          </div>
        )}
        {/* Profile Picture Zoom Modal */}
        {showProfilePicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white rounded-lg shadow-lg p-4 relative flex flex-col items-center">
              <button className="absolute top-2 right-2" onClick={() => setShowProfilePicModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src={`${BACKEND_BASE_URL}${profile?.profile_picture}`}
                alt="Profile Zoom"
                className="w-80 h-80 rounded-full object-cover border"
              />
            </div>
          </div>
        )}
        {showFollowersModal && (
          <Modal isOpen={showFollowersModal} onClose={() => setShowFollowersModal(false)}>
            {loadingFollowers ? <Spinner /> : (
              <ul>
                {followersList.length === 0 ? <li>No followers yet.</li> : followersList.map((f: any) => (
                  <li key={f.id}>{f.username}</li>
                ))}
              </ul>
            )}
          </Modal>
        )}
        {showFollowingModal && (
          <Modal isOpen={showFollowingModal} onClose={() => setShowFollowingModal(false)}>
            <div className="p-4">
              <h2 className="text-xl font-bold mb-2">Following ({followingList.length})</h2>
              {loadingFollowing ? <Spinner /> : (
                <ul className="space-y-3">
                  {followingList.length === 0 ? (
                    <li className="text-gray-500">Not following anyone yet.</li>
                  ) : (
                    followingList.map((f: any) => (
                      <li key={f.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded shadow-sm">
                        <img src={f.profile_picture ? `${BACKEND_BASE_URL}${f.profile_picture}` : '/default-avatar.png'} alt={f.username} className="w-10 h-10 rounded-full object-cover border" />
                        <span className="font-medium flex-1">{f.username}</span>
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          onClick={() => navigate(`/profile/${f.id}`)}
                        >
                          View Profile
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </Modal>
        )}
        {selectedPost && (
          <FullScreenPostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
        )}
      </div>
    </div>
  );
};
import React, { useEffect, useState } from "react";
import { usePostContext } from "../../../core/application/context/PostContext";
import EditPostModal from "../modal/EditPostModal";
import { Post, Comment } from "../../../core/domain/entities/Post";
import { useAuth } from "../../../core/application/context/AuthContext";
import FullScreenPostModal from "../modal/FullScreenPostModal";
import { useNavigate } from "react-router-dom";
import Spinner from "../../ui/Spinner";
import MainLayout from "../../components/MainLayout";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const PostFeedPage: React.FC = () => {
  const {
    posts,
    likepost,
    commentOnPost,
    deletePost,
    fetchPosts,
    updateComment,
    deleteComment,
    getComments,
  } = usePostContext();
  const { isAuthenticated, user } = useAuth();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [openCommentSectionId, setOpenCommentSectionId] = useState<number | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [fullScreenPost, setFullScreenPost] = useState<Post | null>(null);
  const [openDropdownPostId, setOpenDropdownPostId] = useState<number | null>(null);
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const toggleDropdown = (postId: number) => {
    setOpenDropdownPostId(openDropdownPostId === postId ? null : postId);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(id);
    }
  };

  const handleCommentSubmit = async (postId: number) => {
    if (newComment.trim()) {
      await commentOnPost(postId, newComment);
      setNewComment("");
      fetchComments(postId);
    }
  };

  const handleReplySubmit = async (postId: number, parentId: number) => {
    if (replyText.trim()) {
      await commentOnPost(postId, replyText, parentId);
      setReplyText("");
      setReplyToCommentId(null);
      fetchComments(postId);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (editedComment.trim()) {
      await updateComment(commentId, editedComment);
      setEditingCommentId(null);
      setEditedComment("");
      if (openCommentSectionId) {
        fetchComments(openCommentSectionId);
      }
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteComment(commentId);
      if (openCommentSectionId) {
        fetchComments(openCommentSectionId);
      }
    }
  };

  const fetchComments = async (postId: number) => {
    try {
      const comments = await getComments(postId);
      setComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      setLoading(true);
      fetchPosts().finally(() => setLoading(false));
    }
  }, []);

  useEffect(() => {
    if (openCommentSectionId) {
      fetchComments(openCommentSectionId);
    }
  }, [openCommentSectionId]);

  return (
    <MainLayout>
      <div className="flex justify-center p-4 min-h-screen bg-gray-50">
        <div className="w-full max-w-4xl">
          <h1 className="text-2xl font-bold mb-4">Feed</h1>
          {loading ? (
            <Spinner />
          ) : (
            posts.map((post) => (
              <div key={post.id} className="border p-4 mb-4 rounded">
                <div className="flex items-center mb-2">
                  <img
                    src={`${BACKEND_BASE_URL}${post.profile.profile_picture}`}
                    alt={post.profile.username}
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <span className="font-bold">{post.profile.username}</span>
                  {user && post.profile?.user?.id === user.id && (
                    <div className="ml-auto relative">
                      <button
                        onClick={() => toggleDropdown(post.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ⋮
                      </button>
                      {openDropdownPostId === post.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg">
                          <button
                            onClick={() => {
                              setEditingPost(post);
                              setOpenDropdownPostId(null);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              handleDelete(post.id);
                              setOpenDropdownPostId(null);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {post.content && (
                  <p
                    className="mb-2 cursor-pointer hover:underline"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    {post.content}
                  </p>
                )}
                {post.image && (
                  <img
                    src={`${BACKEND_BASE_URL}${post.image}`}
                    alt="Post"
                    className="w-[960px] h-[336px] object-cover rounded cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  />
                )}
                <div className="flex space-x-4 mt-2">
                  <button onClick={() => likepost(post.id)} className="flex items-center">
                    <span>👍</span>
                    <span>{post.likes}</span>
                  </button>
                  <button
                    onClick={() => setOpenCommentSectionId(post.id === openCommentSectionId ? null : post.id)}
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
                      <div key={comment.id} className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <img
                            src={`${BACKEND_BASE_URL}${comment.profile.profile_picture}`}
                            alt={comment.profile.username}
                            className="w-8 h-8 rounded-full mr-2"
                          />
                          <div>
                            <span className="font-bold">{comment.profile.username}</span>
                            {editingCommentId === comment.id ? (
                              <input
                                type="text"
                                value={editedComment}
                                onChange={(e) => setEditedComment(e.target.value)}
                                className="ml-2 p-1 border rounded"
                              />
                            ) : (
                              <p className="text-sm">{comment.comment}</p>
                            )}
                            <button
                              onClick={() => setReplyToCommentId(comment.id)}
                              className="text-blue-500 ml-2"
                            >
                              Reply
                            </button>
                            {replyToCommentId === comment.id && (
                              <div className="flex items-center mt-2 ml-4">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className="flex-grow p-2 border rounded"
                                />
                                <button
                                  onClick={() => handleReplySubmit(post.id, comment.id)}
                                  className="ml-2 bg-green-500 text-white px-4 py-2 rounded"
                                >
                                  Reply
                                </button>
                              </div>
                            )}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="ml-8 mt-2">
                                {comment.replies.map((reply) => (
                                  <div key={reply.id} className="flex items-center mb-2">
                                    <img
                                      src={`${BACKEND_BASE_URL}${reply.profile.profile_picture}`}
                                      alt={reply.profile.username}
                                      className="w-6 h-6 rounded-full mr-2"
                                    />
                                    <div>
                                      <span className="font-bold text-sm">{reply.profile.username}</span>
                                      <p className="text-sm">{reply.comment}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {editingCommentId === comment.id ? (
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              className="text-green-500"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingCommentId(comment.id);
                                setEditedComment(comment.comment);
                              }}
                              className="text-blue-500"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
          {editingPost && (
            <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} />
          )}
          {fullScreenPost && (
            <FullScreenPostModal post={fullScreenPost} onClose={() => setFullScreenPost(null)} />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default PostFeedPage;
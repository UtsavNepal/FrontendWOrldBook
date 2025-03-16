// src/presentation/pages/PostFeedPage.tsx

import React, { useEffect, useState } from "react";
import { usePostContext } from "../../../core/application/context/PostContext";
import EditPostModal from "../modal/EditPostModal";
import { Post } from "../../../core/domain/entities/Post";

const BACKEND_BASE_URL = "http://127.0.0.1:8000";

const PostFeedPage: React.FC = () => {
  const { posts, likepost, commentOnPost, deletePost, fetchPosts, updateComment, deleteComment } = usePostContext();
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [openCommentSectionId, setOpenCommentSectionId] = useState<number | null>(null); // Track which post's comment section is open
  const [newComment, setNewComment] = useState(""); // State for new comment input
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null); // Track which comment is being edited
  const [editedCommentContent, setEditedCommentContent] = useState(""); // State for edited comment content

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      await deletePost(id);
    }
  };

  const handleCommentSubmit = async (postId: number) => {
    if (newComment.trim()) {
      await commentOnPost(postId, newComment);
      setNewComment(""); // Clear the input after submitting
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (editedCommentContent.trim()) {
      await updateComment(commentId, editedCommentContent);
      setEditingCommentId(null); // Exit edit mode
      setEditedCommentContent(""); // Clear the input
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      await deleteComment(commentId);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="flex justify-center p-4">
      <div className="w-full max-w-4xl"> {/* Center-align and set max width */}
        <h1 className="text-2xl font-bold mb-4">Feed</h1>
        {posts.map((post) => (
          <div key={post.id} className="border p-4 mb-4 rounded">
            <div className="flex items-center mb-2">
              <img
                src={`${BACKEND_BASE_URL}${post.profile.profile_picture}`}
                alt={post.profile.username}
                className="w-10 h-10 rounded-full mr-2"
              />
              <span className="font-bold">{post.profile.username}</span>
              <button
                onClick={() => setEditingPost(post)}
                className="ml-auto text-blue-500"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(post.id)}
                className="ml-2 text-red-500"
              >
                Delete
              </button>
            </div>
            {post.content && <p className="mb-2">{post.content}</p>}
            {post.image && (
              <img
                src={`${BACKEND_BASE_URL}${post.image}`}
                alt="Post"
                className="w-[960px] h-[336px] object-cover rounded" // Fixed image size
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
                <span>{post.comments.length}</span>
              </button>
            </div>

            {/* Comment Section */}
            {openCommentSectionId === post.id && (
              <div className="mt-4">
                {/* Add New Comment */}
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

                {/* Display Comments */}
                {post.comments.map((comment) => (
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
                            value={editedCommentContent}
                            onChange={(e) => setEditedCommentContent(e.target.value)}
                            className="ml-2 p-1 border rounded"
                          />
                        ) : (
                          <p className="text-sm">{comment.content}</p>
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
                            setEditedCommentContent(comment.content);
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
        ))}
        {editingPost && (
          <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} />
        )}
      </div>
    </div>
  );
};

export default PostFeedPage;
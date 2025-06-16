import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/application/context/AuthContext";
import { postRepository } from '../../../infrastructure/repositories/PostRepository';
import Spinner from "../../ui/Spinner";
import Navbar from "../../components/Navabar";
import EditPostModal from "../modal/EditPostModal";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ViewPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await postRepository.getById(id!);
        setPost(data);
      } catch (err) {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    await postRepository.toggleLikePost(post.id);
    // Refetch post to update likes
    const data = await postRepository.getById(id!);
    setPost(data);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setCommenting(true);
    await postRepository.commentOnPost(post.id, commentText);
    setCommentText("");
    // Refetch post to update comments
    const data = await postRepository.getById(id!);
    setPost(data);
    setCommenting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    await postRepository.deletePost(post.id);
    navigate(-1);
  };

  if (loading) return <Spinner />;
  if (!post) return <div className="text-center text-gray-500 py-8">Post not found.</div>;

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex justify-center items-start bg-gray-50 pl-20 sm:pl-24 md:pl-56">
        <div className="w-full max-w-xl p-4 bg-white rounded-lg shadow-md mt-8 mx-auto">
          <div className="flex flex-col items-center mb-6">
            {post.image && (
              <img
                src={post.image.startsWith('http') ? post.image : `${BACKEND_BASE_URL}${post.image}`}
                alt="Post"
                className="w-full max-h-96 object-cover rounded mb-4"
              />
            )}
            <div className="flex items-center gap-3 mb-2">
              <img
                src={post.profile?.profile_picture ? (post.profile.profile_picture.startsWith('http') ? post.profile.profile_picture : `${BACKEND_BASE_URL}${post.profile.profile_picture}`) : "/default-avatar.png"}
                alt={post.profile?.username}
                className="w-10 h-10 rounded-full object-cover border border-gray-200 cursor-pointer"
                onClick={() => navigate(`/profile/${post.profile?.id}`)}
              />
              <span
                className="font-semibold text-gray-800 cursor-pointer hover:underline"
                onClick={() => navigate(`/profile/${post.profile?.id}`)}
              >
                {post.profile?.username}
              </span>
            </div>
            <div className="text-gray-700 text-lg mb-2 w-full text-left">{post.content}</div>
            <div className="flex gap-4 mb-4 w-full">
              <button
                onClick={handleLike}
                className="text-blue-500 hover:underline"
              >
                Like ({post.likes})
              </button>
              {user && post.profile?.user?.id === user.id && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-yellow-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Comments</h4>
            {post.comments && post.comments.length > 0 ? (
              <ul className="divide-y divide-gray-100 mb-4">
                {post.comments.map((comment: any) => (
                  <li key={comment.id} className="py-2">
                    <span className="font-semibold text-gray-800">{comment.profile?.username}:</span> {comment.comment}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-400 mb-4">No comments yet.</div>
            )}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="border p-2 rounded w-full"
                placeholder="Write a comment..."
                disabled={commenting}
              />
              <button
                onClick={handleComment}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={commenting}
              >
                Post
              </button>
            </div>
          </div>
          {editing && (
            <EditPostModal post={post} onClose={() => { setEditing(false); setPost({ ...post }); }} />
          )}
        </div>
      </div>
    </>
  );
};

export default ViewPostPage; 
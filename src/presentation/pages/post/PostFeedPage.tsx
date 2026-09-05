import React, { useEffect, useState } from "react";
import { usePostContext } from "../../../core/application/context/PostContext";
import EditPostModal from "../modal/EditPostModal";
import { Post, Comment } from "../../../core/domain/entities/Post";
import { useAuth } from "../../../core/application/context/AuthContext";
import FullScreenPostModal from "../modal/FullScreenPostModal";
import { useNavigate } from "react-router-dom";
import Spinner from "../../ui/Spinner";
import MainLayout from "../../components/MainLayout";
import PageShell from "../../components/PageShell";
import { getImageUrl } from '../../../utils/getImageUrl';
import { MessageCircle } from "lucide-react";
import LikeButton from "../../components/LikeButton";
import PostStoryMedia from "../../components/PostStoryMedia";
import { useConfirm } from "../../components/useConfirm";
import OptionsMenu, { isOwnedBy } from "../../components/OptionsMenu";
import { postStoryLine, visibilityLabel } from "../../../utils/postStory";



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
  const [openCommentSectionId, setOpenCommentSectionId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [fullScreenPost, setFullScreenPost] = useState<Post | null>(null);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { confirm, modal } = useConfirm();

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: "Delete post",
      message: "Are you sure you want to delete this post? This cannot be undone.",
    });
    if (ok) await deletePost(id);
  };

  const handleCommentSubmit = async (postId: string) => {
    if (newComment.trim()) {
      await commentOnPost(postId, newComment);
      setNewComment("");
      fetchComments(postId);
    }
  };

  const handleReplySubmit = async (postId: string, parentId: string) => {
    if (replyText.trim()) {
      await commentOnPost(postId, replyText, parentId);
      setReplyText("");
      setReplyToCommentId(null);
      fetchComments(postId);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (editedComment.trim()) {
      await updateComment(commentId, editedComment);
      setEditingCommentId(null);
      setEditedComment("");
      if (openCommentSectionId) {
        fetchComments(openCommentSectionId);
      }
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const ok = await confirm({
      title: "Delete comment",
      message: "Are you sure you want to delete this comment?",
    });
    if (!ok) return;
    await deleteComment(commentId);
    if (openCommentSectionId) {
      fetchComments(openCommentSectionId);
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const comments = await getComments(postId);
      setComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  // Helper to render comments with only one level of replies
  const renderComments = (commentsList: Comment[], postId: string, isReply = false) =>
    [...commentsList].reverse().map((comment) => (
      <div key={comment.id} className={`mb-3 flex items-start justify-between ${isReply ? "ml-10" : ""}`}>
        <div className="flex items-start">
          <img
            src={getImageUrl(comment.profile.profile_picture)}
            alt={comment.profile.username}
            className="mr-2 h-7 w-7 shrink-0 rounded-full object-cover"
          />
          <div className="rounded-2xl bg-wb-canvas px-3 py-2">
            <span className="text-sm font-semibold">{comment.profile.username}</span>
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
            {/* Only render one level of replies */}
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
            onEdit={() => {
              setEditingCommentId(comment.id);
              setEditedComment(comment.comment);
            }}
            onDelete={() => handleDeleteComment(comment.id)}
          />
        ) : null}
      </div>
    ));

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
      {modal}
      <PageShell>
        <button
          onClick={() => navigate("/create-post")}
          className="wb-card mb-4 flex w-full items-center gap-3 px-4 py-3 text-left"
        >
          <img src={getImageUrl(user?.profile_picture)} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
          <span className="flex-1 rounded-full bg-wb-canvas px-4 py-2.5 text-sm text-wb-muted">
            What's on your mind, {user?.firstname || "there"}?
          </span>
        </button>
        {loading ? (
          <Spinner />
        ) : posts.length === 0 ? (
          <div className="wb-empty">No posts yet. Create the first one.</div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="wb-card mb-4 overflow-hidden">
              <div className="flex items-center px-4 py-3">
                <img
                  src={getImageUrl(post.profile.profile_picture)}
                  alt={post.profile.username}
                  className="mr-3 h-9 w-9 shrink-0 cursor-pointer rounded-full object-cover"
                  onClick={() => navigate(`/profile/${post.profile.user?.id || post.profile.username}`)}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{post.profile.username}</span>
                    {postStoryLine(post) && <span className="font-normal"> {postStoryLine(post)}</span>}
                  </p>
                  <p className="text-xs text-wb-muted">{visibilityLabel(post.visibility)}</p>
                </div>
                {isOwnedBy(post.profile?.user?.id, user?.id) && (
                  <OptionsMenu
                    onEdit={() => setEditingPost(post)}
                    onDelete={() => handleDelete(post.id)}
                  />
                )}
              </div>
              {post.content && (
                <p className="cursor-pointer px-4 pb-3 text-[15px]" onClick={() => navigate(`/post/${post.id}`)}>
                  {post.content}
                </p>
              )}
              <PostStoryMedia post={post} onImageClick={() => navigate(`/post/${post.id}`)} />
              <div className="flex border-t border-wb-line px-2 py-1">
                <LikeButton
                  liked={post.is_liked}
                  count={post.likes || 0}
                  onClick={() => likepost(post.id)}
                />
                <button
                  onClick={() => setOpenCommentSectionId(post.id === openCommentSectionId ? null : post.id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-wb-muted hover:bg-wb-canvas"
                >
                  <MessageCircle size={18} />
                  {post.comments?.length || 0} Comment
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
                    <button onClick={() => handleCommentSubmit(post.id)} className="wb-btn-primary">
                      Post
                    </button>
                  </div>
                  {renderComments(comments, post.id)}
                </div>
              )}
            </article>
          ))
        )}
        {editingPost && (
          <EditPostModal post={editingPost} onClose={() => setEditingPost(null)} />
        )}
        {fullScreenPost && (
          <FullScreenPostModal post={fullScreenPost} onClose={() => setFullScreenPost(null)} />
        )}
      </PageShell>
    </MainLayout>
  );
};

export default PostFeedPage;
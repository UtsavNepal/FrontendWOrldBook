import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/application/context/AuthContext";
import { postRepository } from '../../../infrastructure/repositories/PostRepository';
import Spinner from "../../ui/Spinner";
import MainLayout from "../../components/MainLayout";
import PageShell from "../../components/PageShell";
import EditPostModal from "../modal/EditPostModal";
import { getImageUrl } from '../../../utils/getImageUrl';
import { MessageCircle } from "lucide-react";
import LikeButton from "../../components/LikeButton";
import PostStoryMedia from "../../components/PostStoryMedia";
import { postStoryLine, visibilityLabel } from "../../../utils/postStory";
import { useConfirm } from "../../components/useConfirm";
import OptionsMenu, { isOwnedBy } from "../../components/OptionsMenu";

const ViewPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { confirm, modal } = useConfirm();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedComment, setEditedComment] = useState("");

  const refreshPost = async () => {
    if (!id) return;
    const data = await postRepository.getById(id);
    setPost(data);
  };

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await postRepository.getById(id!);
        setPost(data);
      } catch {
        setPost(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    const data = await postRepository.toggleLikePost(post.id);
    setPost(data);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setCommenting(true);
    await postRepository.commentOnPost(post.id, commentText);
    setCommentText("");
    await refreshPost();
    setCommenting(false);
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete post",
      message: "Are you sure you want to delete this post? This cannot be undone.",
    });
    if (!ok) return;
    await postRepository.deletePost(post.id);
    navigate(-1);
  };

  const handleSaveComment = async (commentId: string) => {
    if (!editedComment.trim()) return;
    await postRepository.updateComment(commentId, editedComment);
    setEditingCommentId(null);
    setEditedComment("");
    await refreshPost();
  };

  const handleDeleteComment = async (commentId: string) => {
    const ok = await confirm({
      title: "Delete comment",
      message: "Are you sure you want to delete this comment?",
    });
    if (!ok) return;
    await postRepository.deleteComment(commentId);
    await refreshPost();
  };

  if (loading) {
    return (
      <MainLayout>
        <PageShell>
          <Spinner />
        </PageShell>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout>
        <PageShell>
          <div className="wb-empty">Post not found.</div>
        </PageShell>
      </MainLayout>
    );
  }

  const ownsPost = isOwnedBy(post.profile?.user?.id, user?.id);

  return (
    <MainLayout>
      {modal}
      <PageShell>
        <article className="wb-card overflow-hidden">
          <div className="flex items-center px-4 py-3">
            <img
              src={getImageUrl(post.profile?.profile_picture)}
              alt={post.profile?.username}
              className="mr-3 h-10 w-10 cursor-pointer rounded-full object-cover"
              onClick={() => navigate(`/profile/${post.profile?.user?.id || post.profile?.id}`)}
            />
            <div className="min-w-0 flex-1">
              <p
                className="cursor-pointer text-sm hover:underline"
                onClick={() => navigate(`/profile/${post.profile?.user?.id || post.profile?.id}`)}
              >
                <span className="font-semibold">{post.profile?.username}</span>
                {postStoryLine(post) && <span className="font-normal"> {postStoryLine(post)}</span>}
              </p>
              <p className="text-xs text-wb-muted">{visibilityLabel(post.visibility)}</p>
            </div>
            {ownsPost && (
              <OptionsMenu onEdit={() => setEditing(true)} onDelete={handleDelete} />
            )}
          </div>
          {post.content && <p className="px-4 pb-3 text-[15px]">{post.content}</p>}
          <PostStoryMedia post={post} />
          <div className="flex border-t border-wb-line px-2 py-1">
            <LikeButton
              liked={post.is_liked}
              count={post.likes || 0}
              onClick={handleLike}
            />
            <span className="flex flex-1 items-center justify-center gap-2 py-2 text-sm font-semibold text-wb-muted">
              <MessageCircle size={18} />
              {post.comments?.length || 0} Comment
            </span>
          </div>
          <div className="border-t border-wb-line px-4 py-3">
            {post.comments?.length ? (
              <ul className="mb-3 space-y-3">
                {post.comments.map((comment: any) => {
                  const ownsComment = isOwnedBy(comment.profile?.user?.id, user?.id);
                  return (
                    <li key={comment.id} className="flex items-start gap-2">
                      <img
                        src={getImageUrl(comment.profile?.profile_picture)}
                        alt=""
                        className="h-8 w-8 rounded-full object-cover"
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
                            <p className="text-sm">{comment.comment}</p>
                          )}
                        </div>
                      </div>
                      {editingCommentId === comment.id ? (
                        <div className="ml-auto flex shrink-0 gap-2">
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
                      ) : ownsComment ? (
                        <OptionsMenu
                          onEdit={() => {
                            setEditingCommentId(comment.id);
                            setEditedComment(comment.comment);
                          }}
                          onDelete={() => handleDeleteComment(comment.id)}
                        />
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mb-3 text-sm text-wb-muted">No comments yet.</p>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="wb-input"
                placeholder="Write a comment..."
                disabled={commenting}
              />
              <button onClick={handleComment} className="wb-btn-primary" disabled={commenting}>
                Post
              </button>
            </div>
          </div>
        </article>
        {editing && (
          <EditPostModal
            post={post}
            onClose={async () => {
              setEditing(false);
              await refreshPost();
            }}
          />
        )}
      </PageShell>
    </MainLayout>
  );
};

export default ViewPostPage;

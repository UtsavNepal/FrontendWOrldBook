import React from "react";
import { Post } from "../../../core/domain/entities/Post";
import { getImageUrl, getPostImages } from '../../../utils/getImageUrl';
import PostImageCarousel from "../../components/PostImageCarousel";

interface FullScreenPostModalProps {
  post: Post;
  onClose: () => void;
}

const FullScreenPostModal: React.FC<FullScreenPostModalProps> = ({ post, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="wb-card max-h-[90vh] w-full max-w-3xl overflow-y-auto p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Post by {post.profile.username}</h2>
          <button onClick={onClose} className="rounded-full px-2 text-xl text-wb-muted hover:bg-wb-canvas">
            &times;
          </button>
        </div>
        <div className="flex flex-col space-y-4">
          {post.content && <p>{post.content}</p>}
          <PostImageCarousel images={getPostImages(post)} className="rounded-xl" />
          <div className="flex gap-4 text-sm font-semibold">
            <span className={post.is_liked ? "text-black" : "text-wb-muted"}>
              {post.is_liked ? "Liked" : "Like"} {post.likes || 0}
            </span>
            <span className="text-wb-muted">{post.comments?.length || 0} comments</span>
          </div>
          <div>
            <h3 className="mb-2 font-bold">Comments</h3>
            {post.comments?.map((comment) => (
              <div key={comment.id} className="mb-2 flex items-start gap-2">
                <img
                  src={getImageUrl(comment.profile.profile_picture)}
                  alt={comment.profile.username}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="rounded-2xl bg-wb-canvas px-3 py-2">
                  <span className="text-sm font-semibold">{comment.profile.username}</span>
                  <p className="text-sm">{comment.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullScreenPostModal;

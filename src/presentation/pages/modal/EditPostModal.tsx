import React, { useState } from "react";
import { usePostContext } from "../../../core/application/context/PostContext";
import { Post } from "../../../core/domain/entities/Post";
import PostImagePicker from "../../components/PostImagePicker";
import ProcessProgressBox from "../../components/ProcessProgressBox";
import { getPostImages } from "../../../utils/getImageUrl";
import { runTimedProgress } from "../../../utils/runTimedProgress";
import { isProfileUpdatePost, postStoryLine } from "../../../utils/postStory";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose }) => {
  const [content, setContent] = useState(post.content);
  const [files, setFiles] = useState<File[]>([]);
  const [keep, setKeep] = useState<string[]>(getPostImages(post));
  const [visibility, setVisibility] = useState(post.visibility || "public");
  const [process, setProcess] = useState<{ label: string; percent: number } | null>(null);
  const { updatePost } = usePostContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (process) return;
    setProcess({ label: "Saving post", percent: 1 });
    await Promise.all([
      updatePost(post.id, content, files, visibility, keep),
      runTimedProgress(10000, (percent) => {
        setProcess((current) => current ? { ...current, percent } : current);
      }),
    ]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {process && <ProcessProgressBox label={process.label} percent={process.percent} />}
      <div className="wb-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-5">
        <h1 className="mb-4 text-xl font-bold">Edit post</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          {isProfileUpdatePost(post) && (
            <p className="text-sm text-wb-muted">
              {post.profile?.username} {postStoryLine(post)}
            </p>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={isProfileUpdatePost(post) ? "Add a caption..." : "Write something..."}
            className="wb-input min-h-[120px]"
          />
          {!isProfileUpdatePost(post) && (
          <PostImagePicker
            existing={getPostImages(post)}
            onChange={({ keep: nextKeep, files: nextFiles }) => {
              setKeep(nextKeep);
              setFiles(nextFiles);
            }}
          />
          )}
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="wb-input"
          >
            <option value="public">Public</option>
            <option value="authenticated">Friends only</option>
            <option value="private">Only me</option>
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="wb-btn-secondary" disabled={Boolean(process)}>
              Cancel
            </button>
            <button type="submit" className="wb-btn-primary" disabled={Boolean(process)}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;

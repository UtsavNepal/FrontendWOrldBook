// src/presentation/components/EditPostModal.tsx

import React, { useState } from "react";
import { usePostContext } from "../../../core/application/context/PostContext";
import { Post } from "../../../core/domain/entities/Post";

interface EditPostModalProps {
  post: Post;
  onClose: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onClose }) => {
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState<File | null>(null);
  const [visibility, setVisibility] = useState(post.visibility || "public");
  const { updatePost } = usePostContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePost(post.id, content, image || undefined, visibility);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-4 rounded">
        <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write something..."
            className="w-full p-2 border rounded"
          />
          <input
            type="file"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full p-2 border rounded"
          />
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="public">Public</option>
            <option value="authenticated">Friends Only</option>
            <option value="private">Private</option>
          </select>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded ml-2"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
// src/presentation/pages/CreatePostPage.tsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostContext } from "../../../core/application/context/PostContext";

const CreatePostPage: React.FC = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const navigate = useNavigate();
  const { createPost } = usePostContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPost(content, image || undefined);
    navigate("/feed");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Post</h1>
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
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage;
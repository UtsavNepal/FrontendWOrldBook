import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostContext } from "../../../core/application/context/PostContext";
import MainLayout from "../../components/MainLayout";

const CreatePostPage: React.FC = () => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [visibility, setVisibility] = useState("public");
  const navigate = useNavigate();
  const { createPost } = usePostContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPost(content, image || undefined, visibility);
    navigate("/feed");
  };

  return (
    <MainLayout>
      <div className="flex justify-center items-start min-h-screen bg-gray-50">
        <div className="w-full max-w-xl p-2 sm:p-4 md:p-6 lg:p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-8 mx-auto">
          <h1 className="text-2xl font-bold mb-4 text-center">Create Post</h1>
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
              className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            >
              Post
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default CreatePostPage;
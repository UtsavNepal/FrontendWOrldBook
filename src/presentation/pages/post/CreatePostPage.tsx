import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostContext } from "../../../core/application/context/PostContext";
import { useAuth } from "../../../core/application/context/AuthContext";
import MainLayout from "../../components/MainLayout";
import PageShell from "../../components/PageShell";
import PostImagePicker from "../../components/PostImagePicker";
import ProcessProgressBox from "../../components/ProcessProgressBox";
import { getImageUrl } from "../../../utils/getImageUrl";
import { runTimedProgress } from "../../../utils/runTimedProgress";

const CreatePostPage: React.FC = () => {
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [visibility, setVisibility] = useState("public");
  const [process, setProcess] = useState<{ label: string; percent: number } | null>(null);
  const navigate = useNavigate();
  const { createPost } = usePostContext();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (process) return;
    setProcess({ label: "Posting", percent: 1 });
    await Promise.all([
      createPost(content, files, visibility),
      runTimedProgress(10000, (percent) => {
        setProcess((current) => current ? { ...current, percent } : current);
      }),
    ]);
    setProcess({ label: "Posting", percent: 100 });
    navigate("/feed");
  };

  return (
    <MainLayout>
      {process && <ProcessProgressBox label={process.label} percent={process.percent} />}
      <PageShell title="Create post">
        <form onSubmit={handleSubmit} className="wb-card overflow-hidden p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <img
              src={getImageUrl(user?.profile_picture)}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{user?.username || user?.firstname}</p>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="mt-1 rounded-md border border-wb-line bg-wb-canvas px-2 py-1 text-xs font-medium text-wb-ink"
              >
                <option value="public">Public</option>
                <option value="authenticated">Friends only</option>
                <option value="private">Only me</option>
              </select>
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user?.firstname || "there"}?`}
            className="min-h-[140px] w-full resize-none border-0 bg-transparent text-[17px] outline-none placeholder:text-wb-muted"
          />
          <PostImagePicker onChange={({ files: next }) => setFiles(next)} />
          <button type="submit" className="wb-btn-primary w-full" disabled={Boolean(process) || (!content && files.length === 0)}>
            Post
          </button>
        </form>
      </PageShell>
    </MainLayout>
  );
};

export default CreatePostPage;

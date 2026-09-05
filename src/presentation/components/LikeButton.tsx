import React from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  liked?: boolean;
  count?: number;
  onClick: (event: React.MouseEvent) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ liked, count = 0, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold hover:bg-wb-canvas ${
      liked ? "text-black" : "text-wb-muted"
    }`}
  >
    <Heart size={18} className={liked ? "fill-black text-black" : ""} />
    {count} Like
  </button>
);

export default LikeButton;

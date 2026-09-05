import React from "react";
import { Post } from "../../core/domain/entities/Post";
import { getPostImages } from "../../utils/getImageUrl";
import PostImageCarousel from "./PostImageCarousel";

const PostStoryMedia: React.FC<{ post: Post; onImageClick?: () => void }> = ({ post, onImageClick }) => {
  return <PostImageCarousel images={getPostImages(post)} onImageClick={onImageClick} />;
};

export default PostStoryMedia;

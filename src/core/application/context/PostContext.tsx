import React, { createContext, useContext, useState, useEffect } from "react";
import { PostRepository } from "../../../infrastructure/repositories/PostRepository";
import { Post, Comment } from "../../../core/domain/entities/Post";
import { useAuth } from "./AuthContext";
import { ERRORS } from "../../../constants/errors";
import { prepareImagesForUpload } from "../../../utils/compressImage";

interface PostContextType {
  posts: Post[];
  createPost: (content: string, images?: File[], visibility?: string) => Promise<void>;
  updatePost: (id: string, content: string, images?: File[], visibility?: string, keepImages?: string[]) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  likepost: (id: string) => Promise<void>;
  getComments: (postId: string) => Promise<Comment[]>;
  commentOnPost: (id: string, comment: string, parent?: string) => Promise<void>;
  updateComment: (commentId: string, comment: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  fetchPosts: () => Promise<void>;
}


const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const postRepository = new PostRepository();
  const { isAuthenticated } = useAuth();

  const fetchPosts = async () => {
    try {
      const data = await postRepository.getAll();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const getComments = async (postId: string): Promise<Comment[]> => {
    try {
      return await postRepository.getComments(postId);
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  };

  const createPost = async (content: string, images: File[] = [], visibility: string = "public") => {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);
    const readyImages = await prepareImagesForUpload(images);
    readyImages.forEach((image) => formData.append("images", image));

    try {
      const newPost = await postRepository.createPost(formData);
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const updatePost = async (id: string, content: string, images: File[] = [], visibility: string = "public", keepImages: string[] = []) => {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);
    formData.append("keep_images", JSON.stringify(keepImages));
    const readyImages = await prepareImagesForUpload(images);
    readyImages.forEach((image) => formData.append("images", image));

    try {
      const updatedPost = await postRepository.updatePost(id, formData);
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === id ? updatedPost : post))
      );
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const deletePost = async (id: string) => {
    try {
      await postRepository.deletePost(id);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const likepost = async (id: string) => {
    try {
      const updated = await postRepository.toggleLikePost(id);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id
            ? { ...post, likes: updated.likes, is_liked: updated.is_liked }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  

  const commentOnPost = async (id: string, comment: string, parent?: string) => {
    try {
      const newComment = await postRepository.commentOnPost(id, comment, parent);
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id
            ? { ...post, comments: [...post.comments, newComment] }
            : post
        )
      );
    } catch (error) {
      console.error("Error commenting on post:", error);
    }
  };

  const updateComment = async (commentId: string, comment: string) => {
    try {
      const updatedComment = await postRepository.updateComment(commentId, comment);
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          comments: post.comments.map((c) =>
            c.id === commentId ? updatedComment : c
          ),
        }))
      );
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await postRepository.deleteComment(commentId);
      setPosts((prevPosts) =>
        prevPosts.map((post) => ({
          ...post,
          comments: post.comments.filter((c) => c.id !== commentId),
        }))
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
    }
  }, [isAuthenticated]);

  return (
    <PostContext.Provider
      value={{
        posts,
        createPost,
        updatePost,
        deletePost,
        likepost,
        getComments,
        commentOnPost,
        updateComment,
        deleteComment,
        fetchPosts,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error(ERRORS.postContext.providerRequired);
  }
  return context;
};
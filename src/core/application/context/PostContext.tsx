import React, { createContext, useContext, useState, useEffect } from "react";
import { PostRepository } from "../../../infrastructure/repositories/PostRepository";
import { Post, Comment } from "../../../core/domain/entities/Post";
import { useAuth } from "./AuthContext";

interface PostContextType {
  posts: Post[];
  createPost: (content: string, image?: File, visibility?: string) => Promise<void>;
  updatePost: (id: number, content: string, image?: File, visibility?: string) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  likepost: (id: number) => Promise<void>;
  getComments: (postId: number) => Promise<Comment[]>;
  commentOnPost: (id: number, comment: string, parent?: number) => Promise<void>;
  updateComment: (commentId: number, comment: string) => Promise<void>;
  deleteComment: (commentId: number) => Promise<void>;
  fetchPosts: () => Promise<void>;
}


const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
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

  const getComments = async (postId: number): Promise<Comment[]> => {
    try {
      return await postRepository.getComments(postId);
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  };

  const createPost = async (content: string, image?: File, visibility: string = "public") => {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);
    if (image) {
      formData.append("image", image);
    }

    try {
      const newPost = await postRepository.createPost(formData);
      setPosts((prevPosts) => [newPost, ...prevPosts]);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const updatePost = async (id: number, content: string, image?: File, visibility: string = "public") => {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("visibility", visibility);
    if (image) {
      formData.append("image", image);
    }

    try {
      const updatedPost = await postRepository.updatePost(id, formData);
      setPosts((prevPosts) =>
        prevPosts.map((post) => (post.id === id ? updatedPost : post))
      );
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const deletePost = async (id: number) => {
    try {
      await postRepository.deletePost(id);
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const likepost = async (id: number) => {
    try {
      const isLiked = likedPosts.has(id); // Check if the post is already liked
      await postRepository.toggleLikePost(id);

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id
            ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      );

      // Update the likedPosts set
      if (isLiked) {
        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        setLikedPosts((prev) => new Set(prev).add(id));
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  

  const commentOnPost = async (id: number, comment: string, parent?: number) => {
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

  const updateComment = async (commentId: number, comment: string) => {
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

  const deleteComment = async (commentId: number) => {
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
    throw new Error("usePostContext must be used within a PostProvider");
  }
  return context;
};
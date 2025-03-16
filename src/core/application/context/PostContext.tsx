// src/core/application/context/PostContext.ts

import React, { createContext, useContext, useState, useEffect } from "react";
import { PostRepository } from "../../../infrastructure/repositories/PostRepository";
import { Post } from "../../../core/domain/entities/Post";

interface PostContextType {
    posts: Post[];
    createPost: (content: string, image?: File) => Promise<void>;
    updatePost: (id: number, content: string, image?: File) => Promise<void>;
    deletePost: (id: number) => Promise<void>;
    likepost: (id: number) => Promise<void>;
    commentOnPost: (id: number, content: string) => Promise<void>;
    fetchPosts: () => Promise<void>;
    updateComment: (commentId: number, content: string) => Promise<void>;
    deleteComment: (commentId: number) => Promise<void>;
  }
  
  const PostContext = createContext<PostContextType | undefined>(undefined);
  
  export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const postRepository = new PostRepository();
  
    const fetchPosts = async () => {
      try {
        const data = await postRepository.getAll();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
  
    const createPost = async (content: string, image?: File) => {
      const formData = new FormData();
      formData.append("content", content);
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
  
    const updatePost = async (id: number, content: string, image?: File) => {
      const formData = new FormData();
      formData.append("content", content);
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
        await postRepository.toggleLikePost(id);
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === id ? { ...post, likes: post.likes + 1 } : post
          )
        );
      } catch (error) {
        console.error("Error liking post:", error);
      }
    };
  
    const commentOnPost = async (id: number, content: string) => {
      try {
        const newComment = await postRepository.commentOnPost(id, content);
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
    const updateComment = async (commentId: number, content: string) => {
        try {
          const updatedComment = await postRepository.updateComment(commentId, content);
          setPosts((prevPosts) =>
            prevPosts.map((post) => ({
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId ? updatedComment : comment
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
              comments: post.comments.filter((comment) => comment.id !== commentId),
            }))
          );
        } catch (error) {
          console.error("Error deleting comment:", error);
        }
      };
    
  
    useEffect(() => {
      fetchPosts();
    }, []);
  
    return (
      <PostContext.Provider
        value={{
          posts,
          createPost,
          updatePost,
          deletePost,
          likepost,
          commentOnPost,
          fetchPosts,
          deleteComment,
          updateComment,

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
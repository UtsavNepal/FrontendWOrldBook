import { BaseRepository } from "../base/BaseRepository";
import { Post, Comment } from "../../core/domain/entities/Post";

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super("/profile");
  }

  async getAll(): Promise<Post[]> {
    return this.get<Post[]>("/posts/");
  }

  async createPost(data: FormData): Promise<Post> {
    return this.post<Post>("/posts/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async updatePost(postId: number, data: FormData): Promise<Post> {
    return this.patch<Post>(`/posts/${postId}/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async deletePost(postId: number): Promise<void> {
    await this.delete(`/posts/${postId}/`);
  }

  async toggleLikePost(id: number): Promise<void> {
    await this.post(`/posts/${id}/like/`);
  }

  async getComments(postId: number): Promise<Comment[]> {
    return this.get<Comment[]>(`/posts/${postId}/comment/`);
  }

  async commentOnPost(postId: number, comment: string, parent?: number): Promise<Comment> {
    const payload: any = { comment };
    if (parent) payload.parent = parent;
    return this.post<Comment>(`/posts/${postId}/comment/`, payload);
  }

  async updateComment(commentId: number, comment: string): Promise<Comment> {
    return this.patch<Comment>(`/comments/${commentId}/`, { comment }); 
  }

  async deleteComment(commentId: number): Promise<void> {
    await this.delete(`/comments/${commentId}/`);
  }

  async getById(postId: string | number): Promise<Post> {
    return this.get<Post>(`/posts/${postId}/`);
  }
}

export const postRepository = new PostRepository();
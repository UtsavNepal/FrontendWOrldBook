import { BaseRepository } from "../base/BaseRepository";
import { Post, Comment } from "../../core/domain/entities/Post";

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super("/profile/posts");
  }

  async getAll(): Promise<Post[]> {
    return this.get<Post[]>("");
  }

  async createPost(data: FormData): Promise<Post> {
    return this.post<Post>("/", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async updatePost(id: number, data: FormData): Promise<Post> {
    return this.patch<Post>(`/${id}/`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async deletePost(id: number): Promise<void> {
    await this.delete(`/${id}/`);
  }

  async toggleLikePost(id: number): Promise<void> {
    await this.post(`/${id}/like/`);
  }

  async getComments(postId: number): Promise<Comment[]> {
    return this.get<Comment[]>(`/${postId}/comment/`);
  }

  async commentOnPost(postId: number, comment: string): Promise<Comment> {
    return this.post<Comment>(`/${postId}/comment/`, { comment }); // Use comment instead of content
  }

  async updateComment(commentId: number, comment: string): Promise<Comment> {
    return this.patch<Comment>(`/comments/${commentId}/`, { comment }); // Use comment instead of content
  }

  async deleteComment(commentId: number): Promise<void> {
    await this.delete(`/comments/${commentId}/`);
  }
}
import { BaseRepository } from "../base/BaseRepository";
import { Post, Comment } from "../../core/domain/entities/Post";
import { api } from "../../config/api";
import { censorText } from "../../utils/censorText";

function sanitizeComment(comment: Comment): Comment {
  return {
    ...comment,
    comment: censorText(comment.comment),
    replies: comment.replies?.map(sanitizeComment),
  };
}

function sanitizePost(post: Post): Post {
  return {
    ...post,
    content: censorText(post.content),
    comments: (post.comments || []).map(sanitizeComment),
  };
}

export class PostRepository extends BaseRepository<Post> {
  constructor() {
    super("");
  }

  async getAll(): Promise<Post[]> {
    const posts = await this.get<Post[]>(api.posts.feed());
    return posts.map(sanitizePost);
  }

  async createPost(data: FormData): Promise<Post> {
    const content = data.get("content");
    if (typeof content === "string") data.set("content", censorText(content));
    const post = await this.post<Post>(api.posts.list(), data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return sanitizePost(post);
  }

  async updatePost(postId: string | number, data: FormData): Promise<Post> {
    const content = data.get("content");
    if (typeof content === "string") data.set("content", censorText(content));
    const post = await this.patch<Post>(api.posts.byId(postId), data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return sanitizePost(post);
  }

  async deletePost(postId: string | number): Promise<void> {
    await this.delete(api.posts.byId(postId));
  }

  async toggleLikePost(id: string | number): Promise<Post> {
    const post = await this.post<Post>(api.posts.like(id));
    return sanitizePost(post);
  }

  async getComments(postId: string | number): Promise<Comment[]> {
    const comments = await this.get<Comment[]>(api.posts.comments(postId));
    return comments.map(sanitizeComment);
  }

  async commentOnPost(postId: string | number, comment: string, parent?: string | number): Promise<Comment> {
    const payload: any = { comment: censorText(comment) };
    if (parent) payload.parent = parent;
    const created = await this.post<Comment>(api.posts.comments(postId), payload);
    return sanitizeComment(created);
  }

  async updateComment(commentId: string | number, comment: string): Promise<Comment> {
    const updated = await this.patch<Comment>(api.comments.byId(commentId), { comment: censorText(comment) });
    return sanitizeComment(updated);
  }

  async deleteComment(commentId: string | number): Promise<void> {
    await this.delete(api.comments.byId(commentId));
  }

  async getById(postId: string | number): Promise<Post> {
    const post = await this.get<Post>(api.posts.byId(postId));
    return sanitizePost(post);
  }
}

export const postRepository = new PostRepository();

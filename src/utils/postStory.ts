import { Post } from "../core/domain/entities/Post";

export function postStoryLine(post?: Pick<Post, "post_type"> | null) {
  if (post?.post_type === "profile_picture") return "uploaded a profile picture";
  if (post?.post_type === "cover_photo") return "uploaded a cover photo";
  return "";
}

export function visibilityLabel(visibility?: string) {
  if (visibility === "private") return "Only me";
  if (visibility === "authenticated") return "Friends only";
  return "Public";
}

export function isProfileUpdatePost(post?: Pick<Post, "post_type"> | null) {
  return post?.post_type === "profile_picture" || post?.post_type === "cover_photo";
}

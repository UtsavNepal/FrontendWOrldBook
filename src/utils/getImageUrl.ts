import { backendUrl } from "../config/api";

export const EMPTY_PROFILE_IMAGE = "/profile_empty.svg";

function hasMedia(path?: string | null): path is string {
  return Boolean(path && path.trim());
}

function isAbsoluteUrl(path: string) {
  return /^https?:\/\//i.test(path) || path.startsWith("//");
}

export function getImageUrl(path?: string | null): string {
  if (!hasMedia(path)) return EMPTY_PROFILE_IMAGE;
  const trimmed = path.trim();
  if (isAbsoluteUrl(trimmed)) return trimmed;
  return `${backendUrl}${trimmed}`;
}

export function getPostImages(post?: { image?: string | null; images?: string[] | null } | null): string[] {
  if (!post) return [];
  if (Array.isArray(post.images) && post.images.length) return post.images.filter(Boolean);
  return post.image ? [post.image] : [];
}

export function getCoverUrl(path?: string | null): string | null {
  if (!hasMedia(path)) return null;
  const trimmed = path.trim();
  if (isAbsoluteUrl(trimmed)) return trimmed;
  return `${backendUrl}${trimmed}`;
}

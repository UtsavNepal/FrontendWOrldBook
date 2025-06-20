const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;
 
export function getImageUrl(path?: string | null): string {
  if (!path) return '/default-avatar.png';
  if (path.startsWith('http')) return path;
  return `${BACKEND_BASE_URL}${path}`;
} 
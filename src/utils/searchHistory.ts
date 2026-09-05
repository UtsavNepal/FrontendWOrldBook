const SEARCHES_KEY = "wb_recent_searches";
const VISITED_KEY = "wb_recent_visited";

export interface VisitedProfile {
  id: string;
  username: string;
  firstname?: string;
  lastname?: string;
  profile_picture?: string;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadRecentSearches(): string[] {
  return read<string[]>(SEARCHES_KEY, []);
}

export function saveRecentSearch(term: string): string[] {
  const value = term.trim();
  if (!value) return loadRecentSearches();
  const next = [value, ...loadRecentSearches().filter((item) => item.toLowerCase() !== value.toLowerCase())].slice(0, 8);
  write(SEARCHES_KEY, next);
  return next;
}

export function removeRecentSearch(term: string): string[] {
  const next = loadRecentSearches().filter((item) => item !== term);
  write(SEARCHES_KEY, next);
  return next;
}

export function loadVisitedProfiles(): VisitedProfile[] {
  return read<VisitedProfile[]>(VISITED_KEY, []);
}

export function saveVisitedProfile(person: VisitedProfile): VisitedProfile[] {
  if (!person.id) return loadVisitedProfiles();
  const next = [
    person,
    ...loadVisitedProfiles().filter((item) => String(item.id) !== String(person.id)),
  ].slice(0, 8);
  write(VISITED_KEY, next);
  return next;
}

export function removeVisitedProfile(id: string): VisitedProfile[] {
  const next = loadVisitedProfiles().filter((item) => String(item.id) !== String(id));
  write(VISITED_KEY, next);
  return next;
}

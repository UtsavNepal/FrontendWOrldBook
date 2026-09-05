import React, { useState, useEffect } from "react";
import { userRepository } from "../../infrastructure/repositories/userRepository";
import { useFriendContext } from "../../core/application/context/FriendContext";
import { useAuth } from "../../core/application/context/AuthContext";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import PageShell from "../components/PageShell";
import { getImageUrl } from "../../utils/getImageUrl";
import { Search, X } from "lucide-react";
import {
  loadRecentSearches,
  loadVisitedProfiles,
  removeRecentSearch as deleteRecentSearch,
  removeVisitedProfile as deleteVisitedProfile,
  saveRecentSearch as storeRecentSearch,
  saveVisitedProfile as storeVisitedProfile,
  VisitedProfile,
} from "../../utils/searchHistory";

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => loadRecentSearches());
  const [visitedProfiles, setVisitedProfiles] = useState<VisitedProfile[]>(() => loadVisitedProfiles());
  const { sendFriendRequest, isRequestSent, getSentFriendRequests } = useFriendContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getSentFriendRequests();
    const refreshHistory = () => {
      setRecentSearches(loadRecentSearches());
      setVisitedProfiles(loadVisitedProfiles());
    };
    refreshHistory();
    window.addEventListener("focus", refreshHistory);
    return () => window.removeEventListener("focus", refreshHistory);
  }, []);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      setLoading(false);
      setRecentSearches(loadRecentSearches());
      setVisitedProfiles(loadVisitedProfiles());
      return;
    }
    setLoading(true);
    const timeout = setTimeout(() => {
      userRepository.searchUsers(query).then((users) => {
        setResults(users.filter((u: any) => u.id !== user?.id));
        setLoading(false);
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, user]);

  const saveRecentSearch = (term: string) => {
    setRecentSearches(storeRecentSearch(term));
  };

  const saveVisitedProfile = (person: VisitedProfile) => {
    setVisitedProfiles(storeVisitedProfile(person));
  };

  const removeRecentSearch = (term: string) => {
    setRecentSearches(deleteRecentSearch(term));
  };

  const removeVisitedProfile = (id: string) => {
    setVisitedProfiles(deleteVisitedProfile(id));
  };

  const openProfile = (found: any) => {
    if (query.trim()) saveRecentSearch(query);
    saveVisitedProfile({
      id: String(found.id),
      username: found.username,
      firstname: found.firstname,
      lastname: found.lastname,
      profile_picture: found.profile_picture,
    });
    navigate(`/profile/${found.id}`);
  };

  const submitSearch = () => {
    saveRecentSearch(query);
  };

  const hasHistory = recentSearches.length > 0 || visitedProfiles.length > 0;

  return (
    <MainLayout>
      <PageShell title="Search">
        <form
          className="relative mb-4"
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch();
          }}
        >
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-wb-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people"
            className="wb-input pl-10"
          />
          {query && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-wb-muted"
              onClick={() => setQuery("")}
            >
              <X size={16} />
            </button>
          )}
        </form>

        {!query && hasHistory && (
          <div className="mb-6 space-y-5">
            {recentSearches.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-wb-muted">Recently searched</h2>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((term) => (
                    <div key={term} className="flex items-center rounded-full bg-white shadow-card">
                      <button
                        type="button"
                        onClick={() => setQuery(term)}
                        className="px-3 py-1 text-xs font-medium text-wb-ink"
                      >
                        {term}
                      </button>
                      <button
                        type="button"
                        className="pr-2 text-wb-muted hover:text-wb-ink"
                        onClick={() => removeRecentSearch(term)}
                        aria-label={`Remove ${term}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}
            {visitedProfiles.length > 0 && (
              <section>
                <h2 className="mb-2 text-sm font-semibold text-wb-muted">Visited profiles</h2>
                <ul className="space-y-2">
                  {visitedProfiles.map((person) => (
                    <li key={person.id} className="wb-card flex items-center gap-3 p-3">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                        onClick={() => navigate(`/profile/${person.id}`)}
                      >
                        <img
                          src={getImageUrl(person.profile_picture)}
                          alt={person.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{person.username}</p>
                          {(person.firstname || person.lastname) && (
                            <p className="truncate text-sm text-wb-muted">
                              {[person.firstname, person.lastname].filter(Boolean).join(" ")}
                            </p>
                          )}
                        </div>
                      </button>
                      <button
                        type="button"
                        className="rounded-full p-1 text-wb-muted hover:bg-wb-canvas"
                        onClick={() => removeVisitedProfile(person.id)}
                        aria-label={`Remove ${person.username}`}
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {loading ? (
          <div className="wb-empty">Searching...</div>
        ) : !query ? (
          !hasHistory && <div className="wb-empty">Search for people by name or username.</div>
        ) : results.length === 0 ? (
          <div className="wb-empty">No people found for “{query}”.</div>
        ) : (
          <ul className="space-y-3">
            {results.map((found) => (
              <li key={found.id} className="wb-card flex items-center justify-between gap-3 p-3">
                <button
                  className="flex min-w-0 items-center gap-3 text-left"
                  onClick={() => openProfile(found)}
                >
                  <img
                    src={getImageUrl(found.profile_picture)}
                    alt={found.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{found.username}</p>
                    <p className="truncate text-sm text-wb-muted">
                      {found.firstname} {found.lastname}
                    </p>
                  </div>
                </button>
                {found.is_friend ? (
                  <span className="wb-btn-secondary">Friends</span>
                ) : found.friend_request_received ? (
                  <span className="wb-btn-secondary">Responds</span>
                ) : isRequestSent(found.id) || found.friend_request_sent ? (
                  <button className="wb-btn-secondary" disabled>
                    Requested
                  </button>
                ) : (
                  <button
                    className="wb-btn-primary"
                    onClick={async () => {
                      const created = await sendFriendRequest(found.id);
                      setResults((current) =>
                        current.map((item) =>
                          String(item.id) === String(found.id)
                            ? {
                                ...item,
                                friend_request_sent: true,
                                friend_request_id: created ? String(created.id) : item.friend_request_id,
                              }
                            : item
                        )
                      );
                    }}
                  >
                    Add friend
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </PageShell>
    </MainLayout>
  );
};

export default SearchPage;

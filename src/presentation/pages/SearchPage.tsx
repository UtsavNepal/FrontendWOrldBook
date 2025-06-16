import React, { useState, useEffect } from "react";
import { userRepository } from "../../infrastructure/repositories/userRepository";
import { useFriendContext } from "../../core/application/context/FriendContext";
import { useAuth } from "../../core/application/context/AuthContext";
import { Profile } from "../../core/domain/entities/Profile.entity";
import { useNavigate } from "react-router-dom";

const SearchPage: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const { sendFriendRequest, isRequestSent } = useFriendContext();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value.trim() && !recent.includes(e.target.value.trim())) {
      setRecent((prev) => [e.target.value.trim(), ...prev.slice(0, 4)]);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 pl-20 sm:pl-24 md:pl-56">
      {/* Left: Search and Recent */}
      <div className="w-96 max-w-full bg-white rounded-l-lg p-8 flex flex-col shadow-md" style={{ minHeight: "100vh" }}>
        <h2 className="text-2xl font-bold mb-6">Search</h2>
        <div className="relative mb-6">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Search"
            className="w-full p-3 rounded bg-gray-200 text-lg focus:outline-none"
          />
          {query && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              onClick={() => setQuery("")}
            >
              ×
            </button>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Recent</h3>
          {recent.length === 0 ? (
            <div className="text-gray-400">No recent searches.</div>
          ) : (
            <ul>
              {recent.map((item, idx) => (
                <li key={idx} className="text-gray-700 cursor-pointer hover:underline" onClick={() => setQuery(item)}>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* Right: Results */}
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Suggested for you</h2>
        {loading ? (
          <div className="text-center text-gray-500">Searching...</div>
        ) : (
          <ul className="max-w-2xl mx-auto">
            {results.map((user) => (
              <li key={user.id} className="flex items-center justify-between py-3 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <img
                    src={user.profile_picture
                      ? (user.profile_picture.startsWith('http')
                          ? user.profile_picture
                          : `${import.meta.env.VITE_BACKEND_URL}${user.profile_picture}`)
                      : "/default-avatar.png"}
                    alt={user.username}
                    className="w-12 h-12 rounded-full object-cover cursor-pointer"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  />
                  <div>
                    <div
                      className="font-bold text-gray-800 cursor-pointer hover:underline"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    >
                      {user.username}
                    </div>
                    <div className="text-gray-500 text-sm">{user.firstname} {user.lastname}</div>
                  </div>
                </div>
                <button
                  className={`px-6 py-2 rounded text-white font-semibold ${isRequestSent(user.id) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                  disabled={isRequestSent(user.id)}
                  onClick={() => sendFriendRequest(user.id)}
                >
                  {isRequestSent(user.id) ? "Request Sent" : "Add Friend"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 
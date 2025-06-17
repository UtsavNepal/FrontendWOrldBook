import React, { useState, useEffect } from "react";
import { userRepository } from "../../infrastructure/repositories/userRepository";
import { useFriendContext } from "../../core/application/context/FriendContext";
import { useAuth } from "../../core/application/context/AuthContext";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";

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
    <MainLayout>
      <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
        {/* Left: Search and Recent */}
        <div className="w-full md:w-96 max-w-full bg-white rounded-none md:rounded-l-lg p-4 sm:p-6 md:p-8 flex flex-col shadow-md" style={{ minHeight: "100vh" }}>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Search</h2>
          <div className="relative mb-4 sm:mb-6">
            <input
              type="text"
              value={query}
              onChange={handleSearch}
              placeholder="Search"
              className="w-full p-2 sm:p-3 rounded bg-gray-200 text-base sm:text-lg focus:outline-none"
            />
            {query && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg"
                onClick={() => setQuery("")}
              >
                ×
              </button>
            )}
          </div>
          <div>
            
          </div>
          {/* On small screens, show suggestions below search/recent */}
          <div className="block md:hidden mt-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">Suggested for you</h2>
            {loading ? (
              <div className="text-center text-gray-500 text-sm sm:text-base">Searching...</div>
            ) : (
              <ul className="max-w-2xl mx-auto">
                {results.map((user) => (
                  <li key={user.id} className="flex flex-col sm:flex-row items-center justify-between py-3 border-b border-gray-200 gap-4 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <img
                        src={user.profile_picture
                          ? (user.profile_picture.startsWith('http')
                              ? user.profile_picture
                              : `${import.meta.env.VITE_BACKEND_URL}${user.profile_picture}`)
                          : "/default-avatar.png"}
                        alt={user.username}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer"
                        onClick={() => navigate(`/profile/${user.id}`)}
                      />
                      <div>
                        <div
                          className="font-bold text-gray-800 cursor-pointer hover:underline text-sm sm:text-base"
                          onClick={() => navigate(`/profile/${user.id}`)}
                        >
                          {user.username}
                        </div>
                        <div className="text-gray-500 text-xs sm:text-sm">{user.firstname} {user.lastname}</div>
                      </div>
                    </div>
                    <button
                      className={`w-full sm:w-auto mt-2 sm:mt-0 px-4 sm:px-6 py-2 rounded text-white font-semibold text-xs sm:text-sm ${isRequestSent(user.id) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
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
        {/* Right: Results (hidden on mobile, shown on desktop) */}
        <div className="hidden md:block flex-1 p-4 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-gray-800">Suggested for you</h2>
          {loading ? (
            <div className="text-center text-gray-500 text-sm sm:text-base">Searching...</div>
          ) : (
            <ul className="max-w-2xl mx-auto">
              {results.map((user) => (
                <li key={user.id} className="flex flex-col sm:flex-row items-center justify-between py-3 border-b border-gray-200 gap-4 sm:gap-0">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img
                      src={user.profile_picture
                        ? (user.profile_picture.startsWith('http')
                            ? user.profile_picture
                            : `${import.meta.env.VITE_BACKEND_URL}${user.profile_picture}`)
                        : "/default-avatar.png"}
                      alt={user.username}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover cursor-pointer"
                      onClick={() => navigate(`/profile/${user.id}`)}
                    />
                    <div>
                      <div
                        className="font-bold text-gray-800 cursor-pointer hover:underline text-sm sm:text-base"
                        onClick={() => navigate(`/profile/${user.id}`)}
                      >
                        {user.username}
                      </div>
                      <div className="text-gray-500 text-xs sm:text-sm">{user.firstname} {user.lastname}</div>
                    </div>
                  </div>
                  <button
                    className={`w-full sm:w-auto mt-2 sm:mt-0 px-4 sm:px-6 py-2 rounded text-white font-semibold text-xs sm:text-sm ${isRequestSent(user.id) ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
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
    </MainLayout>
  );
};

export default SearchPage; 
import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  // Define the routes and their corresponding icons
  const navItems = [
    { path: "/welcome", label: "Welcome", icon: "🏠" },
    { path: "/feed", label: "Feed", icon: "📰" },
    { path: "/create-post", label: "Post", icon: "✏️" },
    { path: "/friends", label: "Friends", icon: "🤝" }, 
  ];

  return (
    <nav className="fixed top-0 left-0 h-screen w-20 sm:w-24 md:w-32 bg-white border-r border-gray-200 z-50 flex flex-col items-center py-4 shadow-md
      sm:py-8">
      <div className="flex flex-col items-center w-full space-y-6">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center w-full py-3 px-2 rounded-lg transition-colors duration-200
              ${location.pathname === item.path ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:bg-gray-100"}`}
          >
            <span className="text-2xl mb-1">{item.icon}</span>
            <span className="text-xs sm:text-sm text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
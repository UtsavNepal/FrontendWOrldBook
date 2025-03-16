// src/presentation/components/Navbar.tsx

import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  // Define the routes and their corresponding icons
  const navItems = [
    { path: "/welcome", label: "Welcome", icon: "🏠" },
    { path: "/feed", label: "Feed", icon: "📰" },
    { path: "/create-post", label: "Post", icon: "✏️" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex justify-around p-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center p-2 ${
              location.pathname === item.path
                ? "text-blue-500"
                : "text-gray-500"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
  Menu,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../core/application/context/AuthContext";

const navItems = [
  { path: "/welcome", label: "Home", icon: <Home size={24} /> },
  { path: "/search", label: "Search", icon: <Search size={24} /> },
  { path: "/friends", label: "Friends", icon: <Users size={24} /> },
  
  { path: "/feed", label: "Feeds", icon: <Film size={24} /> },
  { path: "/chat", label: "Messages", icon: <MessageCircle size={24} /> },
  { path: "/notifications", label: "Notifications", icon: <Heart size={24} /> },
  { path: "/create-post", label: "Create", icon: <PlusSquare size={24} /> },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sidebar content for reuse
  const sidebarContent = (
    <div className="flex flex-col items-center w-full">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center gap-4 w-full py-3 px-4 rounded-lg transition-colors duration-200 text-base font-medium
            ${location.pathname.startsWith(item.path) ? "bg-gray-100 text-black" : "text-gray-700 hover:bg-gray-50"}`}
        >
          <span>{item.icon}</span>
          <span className="inline-block">{item.label}</span>
        </Link>
      ))}
      <button
        onClick={() => { logout(); navigate("/login"); setSidebarOpen(false); }}
        className="flex items-center gap-4 w-full py-3 px-4 rounded-lg transition-colors duration-200 text-base font-medium text-gray-700 hover:bg-gray-50 mt-4 border-t border-gray-200"
      >
        <LogOut size={24} />
        <span className="inline-block">Logout</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Hamburger menu for mobile, always visible */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white rounded-full p-2 shadow border border-gray-200"
        aria-label="Open navigation menu"
        onClick={() => setSidebarOpen((open) => !open)}
      >
        <Menu size={28} />
      </button>
      {/* Sidebar for desktop */}
      <nav className="hidden md:flex fixed top-0 left-0 h-screen w-56 bg-white border-r border-gray-200 flex-col items-center py-6 shadow-md z-40">
        {sidebarContent}
      </nav>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Overlay background */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30 transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation menu"
          />
          {/* Sidebar drawer */}
          <nav className="relative w-64 max-w-full h-full bg-white border-r border-gray-200 flex flex-col items-center py-6 shadow-md animate-slide-in-left">
            {sidebarContent}
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;
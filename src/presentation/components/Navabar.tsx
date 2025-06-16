import React from "react";
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

  return (
    <nav className="fixed top-0 left-0 h-screen w-20 sm:w-24 md:w-56 bg-white border-r border-gray-200 z-50 flex flex-col items-center py-6 shadow-md">
      <div className="flex flex-col items-center w-full space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-4 w-full py-3 px-4 rounded-lg transition-colors duration-200 text-base font-medium
              ${location.pathname.startsWith(item.path) ? "bg-gray-100 text-black" : "text-gray-700 hover:bg-gray-50"}`}
          >
            <span>{item.icon}</span>
            <span className="hidden md:inline-block">{item.label}</span>
          </Link>
        ))}
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="flex items-center gap-4 w-full py-3 px-4 rounded-lg transition-colors duration-200 text-base font-medium text-gray-700 hover:bg-gray-50 mt-4 border-t border-gray-200"
        >
          <Menu size={24} />
          <span className="hidden md:inline-block">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
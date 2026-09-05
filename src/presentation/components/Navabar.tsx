import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  User,
  MessageCircle,
  Heart,
  PlusSquare,
  Menu,
  Users,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "../../core/application/context/AuthContext";
import { useChatContext } from "../../core/application/context/ChatContext";
import { profileRepository } from "../../infrastructure/repositories/ProfileRepository";
import { getImageUrl } from "../../utils/getImageUrl";

const sidebarItems = [
  { path: "/welcome", label: "Profile", icon: User, iconClass: "text-wb-blue" },
  { path: "/search", label: "Search", icon: Search, iconClass: "text-amber-500" },
  { path: "/friends", label: "Friends", icon: Users, iconClass: "text-violet-500" },
  { path: "/create-post", label: "Create", icon: PlusSquare, iconClass: "text-wb-blue" },
];

const headerItems = [
  { path: "/feed", label: "Feed", icon: Home, iconClass: "text-sky-500" },
  { path: "/chat", label: "Messages", icon: MessageCircle, iconClass: "text-emerald-500" },
  { path: "/notifications", label: "Notifications", icon: Heart, iconClass: "text-rose-500" },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isChatOpen, toggleChat } = useChatContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await profileRepository.getNotifications();
        setUnreadCount(notifications.filter((n: any) => n.is_read === false).length);
      } catch {
        setUnreadCount(0);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const headerLinks = (
    <div className="flex items-center gap-1 sm:gap-2">
      {headerItems.map((item) => {
        const Icon = item.icon;
        const isMessages = item.label === "Messages";
        const active = isMessages ? isChatOpen : location.pathname.startsWith(item.path);
        const className = `relative flex h-10 w-10 items-center justify-center rounded-full transition ${
          active ? "bg-wb-canvas" : "hover:bg-wb-canvas"
        }`;
        const icon = (
          <span className={item.iconClass}>
            <Icon
              size={22}
              strokeWidth={active ? 2.4 : 2}
              className={item.label === "Notifications" ? "fill-rose-500" : undefined}
            />
          </span>
        );
        if (isMessages) {
          return (
            <button
              key={item.path}
              type="button"
              title={item.label}
              aria-label={item.label}
              onClick={() => {
                setSidebarOpen(false);
                toggleChat();
              }}
              className={className}
            >
              {icon}
            </button>
          );
        }
        return (
          <Link
            key={item.path}
            to={item.path}
            title={item.label}
            aria-label={item.label}
            onClick={() => setSidebarOpen(false)}
            className={className}
          >
            {icon}
            {item.label === "Notifications" && unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[11px] font-bold leading-none text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );

  const sidebarContent = (
    <div className="flex h-full w-full flex-col px-3">
      <div className="flex flex-1 flex-col gap-1 pt-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition ${
                active
                  ? "bg-wb-canvas text-wb-ink md:bg-white md:shadow-card"
                  : "text-wb-ink hover:bg-wb-canvas md:hover:bg-white"
              }`}
            >
              <span className={item.iconClass}>
                <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto border-t border-wb-line py-3">
        <button
          onClick={() => navigate("/welcome")}
          className="mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-wb-canvas md:hover:bg-white"
        >
          <img
            src={getImageUrl(user?.profile_picture)}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="truncate text-sm font-semibold">
            {user?.firstname || user?.email || "Your profile"}
          </span>
        </button>
        <button
          onClick={() => {
            logout();
            navigate("/login");
            setSidebarOpen(false);
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-wb-muted hover:bg-wb-canvas md:hover:bg-white"
        >
          <LogOut size={22} className="text-red-500" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <header className="fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-wb-line bg-white px-4 md:px-6">
        <div className="flex items-center">
          <button
            className="mr-2 rounded-lg p-1.5 hover:bg-wb-canvas md:hidden"
            aria-label="Open navigation menu"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <Link to="/feed" className="text-lg font-bold text-wb-blue md:text-2xl">
            WorldBook
          </Link>
        </div>
        {headerLinks}
      </header>

      <nav className="hidden md:flex fixed top-14 left-0 z-40 h-[calc(100vh-3.5rem)] w-64 flex-col bg-wb-canvas py-3">
        {sidebarContent}
      </nav>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <nav className="relative h-full w-72 bg-white py-5">
            <button
              className="absolute right-3 top-3 rounded-lg p-1 hover:bg-wb-canvas"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
            <div className="mb-4 px-6 pt-1 text-xl font-bold text-wb-blue">Menu</div>
            {sidebarContent}
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;

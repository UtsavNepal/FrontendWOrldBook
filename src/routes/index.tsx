import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useMemo } from "react";
import { LoginPage } from "../presentation/pages/LoginPage";
import { SignupPage } from "../presentation/pages/SignupPage";
import { WelcomePage } from "../presentation/pages/profile/WelcomePage";
import PostFeedPage from "../presentation/pages/post/PostFeedPage";
import CreatePostPage from "../presentation/pages/post/CreatePostPage";
import Navbar from "../presentation/components/Navabar";
import FriendPage from "../presentation/pages/friend/FriendPage";
import { ProtectedRoute } from "../Private routes/PrivateRoute";
import UserProfilePage from "../presentation/pages/profile/UserProfilePage";

export const AppRoutes = () => {
  const location = useLocation();
  // Show navbar on all main/protected pages, including profile
  const showNavbarRoutes = [
    "/welcome",
    "/feed",
    "/create-post",
    "/friends",
  ];
  // Also show on /profile/:id
  const isProfilePage = location.pathname.startsWith("/profile/");
  const showNavbar = useMemo(
    () => showNavbarRoutes.includes(location.pathname) || isProfilePage,
    [location.pathname, isProfilePage]
  );

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile/:id" element={<UserProfilePage />} />
        <Route path="*" element={<Navigate to="/login" replace />} /> {/* Fallback route */}
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/friends" element={<FriendPage />} />
          <Route path="/feed" element={<PostFeedPage />} />
          <Route path="/create-post" element={<CreatePostPage />} />
        </Route>
      </Routes>
    </>
  );
};
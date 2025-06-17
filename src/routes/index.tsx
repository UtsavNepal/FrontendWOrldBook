import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../presentation/pages/LoginPage";
import { SignupPage } from "../presentation/pages/SignupPage";
import { WelcomePage } from "../presentation/pages/profile/WelcomePage";
import PostFeedPage from "../presentation/pages/post/PostFeedPage";
import CreatePostPage from "../presentation/pages/post/CreatePostPage";
import FriendPage from "../presentation/pages/friend/FriendPage";
import { ProtectedRoute } from "../Private routes/PrivateRoute";
import UserProfilePage from "../presentation/pages/profile/UserProfilePage";
import ChatPage from "../presentation/pages/ChatPage";
import SearchPage from "../presentation/pages/SearchPage";
import NotificationsPage from "../presentation/pages/NotificationsPage";
import ViewPostPage from "../presentation/pages/post/ViewPostPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profile/:id" element={<UserProfilePage />} />
      <Route path="*" element={<Navigate to="/login" replace />} /> 
      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/friends" element={<FriendPage />} />
        <Route path="/feed" element={<PostFeedPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
      </Route>
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/post/:id" element={<ViewPostPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
    </Routes>
  );
};
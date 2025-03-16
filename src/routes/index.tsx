// src/routes/AppRoutes.tsx

import { Routes, Route } from "react-router-dom";
import { LoginPage } from "../presentation/pages/LoginPage";
import { SignupPage } from "../presentation/pages/SignupPage";
import { WelcomePage } from "../presentation/pages/profile/WelcomePage";
import PostFeedPage from "../presentation/pages/post/PostFeedPage";
import CreatePostPage from "../presentation/pages/post/CreatePostPage";
import Navbar from "../presentation/components/Navabar";

const LayoutWithNavbar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">{children}</main>
      <Navbar />
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Routes with Navbar */}
      <Route
        path="/welcome"
        element={
          <LayoutWithNavbar>
            <WelcomePage />
          </LayoutWithNavbar>
        }
      />
      <Route
        path="/feed"
        element={
          <LayoutWithNavbar>
            <PostFeedPage />
          </LayoutWithNavbar>
        }
      />
      <Route
        path="/create-post"
        element={
          <LayoutWithNavbar>
            <CreatePostPage />
          </LayoutWithNavbar>
        }
      />
    </Routes>
  );
};
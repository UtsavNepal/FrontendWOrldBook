import { ReactNode } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { PostProvider } from "./context/PostContext";
import { FriendProvider } from "./context/FriendContext";
import { ChatProvider } from "./context/ChatContext";

interface ProviderProps {
  children: ReactNode;
}

export const Provider = ({ children }: ProviderProps) => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <PostProvider>
          <FriendProvider>
            <ChatProvider>
            {children}
            </ChatProvider>
          </FriendProvider>
        </PostProvider>
      </ProfileProvider>
    </AuthProvider>
  );
};
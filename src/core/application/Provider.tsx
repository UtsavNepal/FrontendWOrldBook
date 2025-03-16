import { ReactNode } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";
import { PostProvider } from "./context/PostContext";

interface ProviderProps {
  children: ReactNode;
}

export const Provider = ({ children }: ProviderProps) => {
  return (
    <AuthProvider>
        <ProfileProvider>
        <PostProvider>{children}
        </PostProvider>
        </ProfileProvider>
    </AuthProvider>
  );
};
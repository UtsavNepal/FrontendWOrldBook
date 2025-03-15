import { ReactNode } from "react";
import { AuthProvider } from "./context/AuthContext";
import { ProfileProvider } from "./context/ProfileContext";

interface ProviderProps {
  children: ReactNode;
}

export const Provider = ({ children }: ProviderProps) => {
  return (
    <AuthProvider>
        <ProfileProvider>{children}</ProfileProvider>
    </AuthProvider>
  );
};
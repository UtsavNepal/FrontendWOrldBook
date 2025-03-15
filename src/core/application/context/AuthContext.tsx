import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthRepository, LoginResponse } from "../../../infrastructure/repositories/AuthRepository";
import { saveTokens, clearTokens, isAuthenticated } from "../../../utils/tokenUtils"; // Import token utilities

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  completeRegistration: (userData: any) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  verifyResetOTP: (email: string, otp: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState(isAuthenticated()); // Use the token utility to check authentication
  const navigate = useNavigate();

  // Check for tokens on app initialization
  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: LoginResponse = await AuthRepository.login(email, password);
      saveTokens(response.access, response.refresh); // Save tokens using the utility
      setIsAuth(true);
      navigate("/welcome");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = () => {
    clearTokens(); 
    setIsAuth(false);
    navigate("/login");
  };

  const signup = async (email: string) => {
    await AuthRepository.signup(email);
  };

  const verifyOTP = async (email: string, otp: string) => {
    await AuthRepository.verifyOTP(email, otp);
  };

  const completeRegistration = async (userData: any) => {
    await AuthRepository.completeRegistration(userData);
    setIsAuth(false);
    navigate("/login", { state: { message: "Thank you for registration!" } });
  };

  const resetPassword = async (email: string, newPassword: string) => {
    await AuthRepository.resetPassword(email, newPassword);
  };

  const requestPasswordReset = async (email: string) => {
    await AuthRepository.requestPasswordReset(email);
  };

  const verifyResetOTP = async (email: string, otp: string) => {
    await AuthRepository.verifyResetOTP(email, otp);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuth,
        login,
        logout,
        signup,
        verifyOTP,
        completeRegistration,
        resetPassword,
        verifyResetOTP,
        requestPasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authRepository } from "../../../infrastructure/repositories/AuthRepository";
import { saveTokens, clearTokens, getAccessToken } from "../../../utils/tokenUtils";
import { profileRepository } from "../../../infrastructure/repositories/ProfileRepository";
import { ERRORS } from "../../../constants/errors";

interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  email: string;
  setEmail: (email: string) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (email: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  completeRegistration: (userData: any) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  verifyResetOTP: (email: string, otp: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  isAuthLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(ERRORS.auth.providerRequired);
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState<string>("");
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  const logout = () => {
    clearTokens();
    setIsAuth(false);
    setUser(null);
    setEmail("");
    navigate("/login", { replace: true });
  };

  const fetchUserData = async () => {
    const userData = await authRepository.getUserProfile();
    let picture = userData.profile_picture;
    try {
      const profileData = await profileRepository.getProfile();
      picture = profileData.profile_picture || picture;
    } catch {
      // Profile can be missing; the session is still valid.
    }
    setUser({
      ...userData,
      profile_picture: picture,
    });
    return userData;
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (!getAccessToken()) {
        setIsAuth(false);
        setUser(null);
        setIsAuthLoading(false);
        return;
      }
      try {
        await fetchUserData();
        setIsAuth(true);
      } catch {
        clearTokens();
        setIsAuth(false);
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const onForcedLogout = () => {
      clearTokens();
      setIsAuth(false);
      setUser(null);
      navigate("/login", { replace: true });
    };
    window.addEventListener("auth:logout", onForcedLogout);
    return () => window.removeEventListener("auth:logout", onForcedLogout);
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authRepository.login(email, password);
      const access = response.access || response.token || "";
      const refresh = response.refresh || access;
      saveTokens(access, refresh);
      setIsAuth(true);
      if (response.user) {
        setUser(response.user);
      }
      try {
        await fetchUserData();
      } catch {
        // Token was just issued; feed can still load.
      }
      navigate("/feed", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const signup = async (email: string) => {
    await authRepository.signup(email);
  };

  const verifyOTP = async (email: string, otp: string) => {
    await authRepository.verifyOTP(email, otp);
  };

  const completeRegistration = async (userData: any) => {
    await authRepository.completeRegistration(userData);
    setIsAuth(false);
    navigate("/login", { state: { message: "Thank you for registration!" } });
  };

  const resetPassword = async (email: string, newPassword: string) => {
    await authRepository.resetPassword(email, newPassword);
  };

  const requestPasswordReset = async (email: string) => {
    await authRepository.requestPasswordReset(email);
  };

  const verifyResetOTP = async (email: string, otp: string) => {
    await authRepository.verifyResetOTP(email, otp);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: isAuth,
        user,
        email,
        setEmail,
        login,
        logout,
        signup,
        verifyOTP,
        completeRegistration,
        resetPassword,
        verifyResetOTP,
        requestPasswordReset,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
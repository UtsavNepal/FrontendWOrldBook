import { axiosInstance } from "./axiosinstance";
import { api } from "../config/api";

// Constants for token storage keys
export const ACCESS_TOKEN_KEY = "access_token";
export const REFRESH_TOKEN_KEY = "refresh_token";

// Save tokens to localStorage
export const saveTokens = (accessToken: string, refreshToken: string): void => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error("Failed to save tokens to localStorage:", error);
  }
};

// Retrieve the access token from localStorage
export const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to retrieve access token from localStorage:", error);
    return null;
  }
};

// Retrieve the refresh token from localStorage
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to retrieve refresh token from localStorage:", error);
    return null;
  }
};

// Clear tokens from localStorage
export const clearTokens = (): void => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error("Failed to clear tokens from localStorage:", error);
  }
};

// Check if the user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAccessToken(); // Returns true if an access token exists
};

// Function to refresh the access token
export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearTokens();
    return null;
  }

  try {
    const response = await axiosInstance.post<{ accessToken: string; access?: string }>(api.auth.refresh(), { refreshToken });
    const newAccessToken = response.data.accessToken || response.data.access || "";
    saveTokens(newAccessToken, refreshToken);
    return newAccessToken;
  } catch (error) {
    console.error("Failed to refresh access token:", error);
    clearTokens();
    return null;
  }
};
// axiosInstance.ts

import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, clearTokens, saveTokens } from "./tokenUtils";


const BASE_URL = "http://127.0.0.1:8000"; // Replace with your backend URL


const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  } as AxiosRequestConfig["headers"],
});

// Utility function to handle token refresh
const handleTokenRefresh = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  try {
    const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
      refresh: refreshToken,
    });

    saveTokens(refreshResponse.data.access, refreshToken);
    return refreshResponse.data.access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearTokens();
    throw error;
  }
};


axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh and errors
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await handleTokenRefresh();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed. Redirecting to login...", refreshError);
        // Redirect to login or handle logout logic
        window.location.href = "/login"; // Example redirect
        return Promise.reject(refreshError);
      }
    }

    console.error("HTTP error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
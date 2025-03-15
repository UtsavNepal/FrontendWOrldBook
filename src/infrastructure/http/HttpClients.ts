import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig, AxiosRequestConfig } from "axios";

// Constants for token storage keys
const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// Base URL for the backend API
const BASE_URL = "http://127.0.0.1:8000"; // Replace with your backend URL

// Create an Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  } as AxiosRequestConfig["headers"], // Properly type the headers
});

// Utility function to handle token refresh
const handleTokenRefresh = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  try {
    const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh/`, {
      refresh: refreshToken,
    });

    localStorage.setItem(TOKEN_KEY, refreshResponse.data.access);
    return refreshResponse.data.access;
  } catch (error) {
    console.error("Token refresh failed:", error);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    throw error;
  }
};

// Add a request interceptor to include the auth token in headers
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
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

    // For other errors, log and rethrow
    console.error("HTTP error:", error);
    return Promise.reject(error);
  }
);

// Define the HttpClient interface
export interface HttpClient {
  get: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
  post: <T>(url: string, data: any, config?: AxiosRequestConfig) => Promise<T>;
  put: <T>(url: string, data: any, config?: AxiosRequestConfig) => Promise<T>;
  patch: <T>(url: string, data: any, config?: AxiosRequestConfig) => Promise<T>;
  delete: <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
}

// Implement the HttpClient
export const httpClient: HttpClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  },

  post: async <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  },

  put: async <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  },

  patch: async <T>(url: string, data: any, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  },
};

// Utility function to handle logout
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.location.href = "/login"; // Redirect to login page
};
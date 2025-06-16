import axios, {  AxiosResponse, AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, refreshAccessToken } from "./tokenUtils";


export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, 
});


axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);


axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };


    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

  
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      clearTokens();
    }

    return Promise.reject(error);
  }
);
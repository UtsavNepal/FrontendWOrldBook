
import { AxiosRequestConfig } from "axios";
import { httpClient } from "../http/HttpClients";

export abstract class BaseRepository<T> {
  protected baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }


  async getAll(config?: AxiosRequestConfig): Promise<T[]> {
    return httpClient.get<T[]>(this.baseUrl, config);
  }

 
  async getById(id: string | number, config?: AxiosRequestConfig): Promise<T> {
    const url = `${this.baseUrl}/${id}`;
    return httpClient.get<T>(url, config);
  }

  async get<ResponseType>(endpoint: string, config?: AxiosRequestConfig): Promise<ResponseType> {
    const url = `${this.baseUrl}${endpoint}`;
    return httpClient.get<ResponseType>(url, config);
  }

  
  async post<ResponseType>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ResponseType> {
    const url = `${this.baseUrl}${endpoint}`;
    return httpClient.post<ResponseType>(url, data, config);
  }

  async put<ResponseType>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ResponseType> {
    const url = `${this.baseUrl}${endpoint}`;
    return httpClient.put<ResponseType>(url, data, config);
  }

  
  async patch<ResponseType>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ResponseType> {
    const url = `${this.baseUrl}${endpoint}`;
    return httpClient.patch<ResponseType>(url, data, config);
  }


  async delete<ResponseType>(endpoint: string, config?: AxiosRequestConfig): Promise<ResponseType> {
    const url = `${this.baseUrl}${endpoint}`;
    return httpClient.delete<ResponseType>(url, config);
  }
}
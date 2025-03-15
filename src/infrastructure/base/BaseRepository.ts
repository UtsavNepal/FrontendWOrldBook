// // src/infrastructure/base/BaseRepository.ts

// import { HttpClient } from "../http/HttpClients";

// export abstract class BaseRepository {
//   protected http: HttpClient;

//   constructor(http: HttpClient) {
//     this.http = http;
//   }

//   protected async get<T>(url: string): Promise<T> {
//     return this.http.get(url);
//   }

//   protected async post<T>(url: string, data: any): Promise<T> {
//     return this.http.post(url, data);
//   }

//   protected async put<T>(url: string, data: any): Promise<T> {
//     return this.http.put(url, data);
//   }

//   protected async patch<T>(url: string, data: any): Promise<T> {
//     return this.http.patch(url, data);
//   }

//   protected async delete<T>(url: string): Promise<T> {
//     return this.http.delete(url);
//   }
// }
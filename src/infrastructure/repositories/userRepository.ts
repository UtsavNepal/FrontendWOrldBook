import { BaseRepository } from "../base/BaseRepository";
import { User } from "../../core/domain/entities/User.entity";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super("/api"); // Adjust base URL as needed
  }

  async signup(formData: {
    firstname: string;
    lastname: string;
    birthday: string;
    gender: string;
    email: string;
    password: string;
  }): Promise<any> {
    return this.post<any>("/auth/signup/", formData);
  }

  async verifyOtp(email: string, otp: string): Promise<any> {
    return this.post<any>("/auth/verify-otp/", { email, otp });
  }

  async completeRegistration(email: string, userData: {
    firstname: string;
    lastname: string;
    birthday: string;
    gender: string;
    password: string;
  }): Promise<any> {
    return this.post<any>("/auth/complete-registration/", { email, ...userData });
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.get<User[]>(`/users/search/?q=${encodeURIComponent(query)}`);
  }
}

export const userRepository = new UserRepository();
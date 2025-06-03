import { BaseRepository } from "../base/BaseRepository";
import { User } from "../../core/domain/entities/User.entity";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super("/api"); // Adjust base URL as needed
  }

  async signup(formData: Omit<User, "id">): Promise<any> {
    return this.post<any>("/auth/signup/", formData);
  }

  async verifyOtp(email: string, otp: string): Promise<any> {
    return this.post<any>("/auth/verify-otp/", { email, otp });
  }

  async completeRegistration(email: string, firstname: string, lastname: string, password: string): Promise<any> {
    return this.post<any>("/auth/complete-registration/", { email, firstname, lastname, password });
  }
}

export const userRepository = new UserRepository(); 
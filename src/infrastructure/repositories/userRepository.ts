import { BaseRepository } from "../base/BaseRepository";
import { User } from "../../core/domain/entities/User.entity";
import { api } from "../../config/api";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super("");
  }

  async signup(formData: {
    firstname: string;
    lastname: string;
    birthday: string;
    gender: string;
    email: string;
  }): Promise<any> {
    return this.post<any>(api.auth.signupStart(), formData);
  }

  async verifyOtp(email: string, otp: string): Promise<any> {
    return this.post<any>(api.auth.verifyOtp(), { email, otp });
  }

  async completeRegistration(email: string, userData: {
    password: string;
  }): Promise<any> {
    return this.post<any>(api.auth.completeRegistration(), { email, ...userData });
  }

  async searchUsers(query: string): Promise<User[]> {
    return this.get<User[]>(api.users.search(query));
  }
}

export const userRepository = new UserRepository();

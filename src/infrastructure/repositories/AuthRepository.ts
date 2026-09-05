import { BaseRepository } from "../base/BaseRepository";
import { User } from "../../core/domain/entities/User.entity";
import { api } from "../../config/api";

export interface LoginResponse {
  access: string;
  refresh: string;
  token?: string;
  user?: any;
}

export interface SignupResponse {
  message: string;
}

export interface VerifyOTPResponse {
  message?: string;
  success?: boolean;
}

export interface CompleteRegistrationResponse {
  message: string;
}

export interface RequestPasswordResetResponse {
  message: string;
}

export interface VerifyResetOTPResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  birthday: string;
  gender: string;
  profile_picture?: string;
  profile_id?: string;
}

export class AuthRepository extends BaseRepository<any> {
  constructor() {
    super("");
  }

  async getUsers(): Promise<User[]> {
    return this.get<User[]>(api.users.list());
  }

  async signup(email: string): Promise<SignupResponse> {
    return this.post<SignupResponse>(api.auth.signupStart(), { email });
  }

  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    return this.post<VerifyOTPResponse>(api.auth.verifyOtp(), { email, otp });
  }

  async completeRegistration(userData: User): Promise<CompleteRegistrationResponse> {
    return this.post<CompleteRegistrationResponse>(api.auth.completeRegistration(), userData);
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    return this.post<LoginResponse>(api.auth.login(), { email, password });
  }

  async requestPasswordReset(email: string): Promise<RequestPasswordResetResponse> {
    return this.post<RequestPasswordResetResponse>(api.auth.requestPasswordReset(), { email });
  }

  async verifyResetOTP(email: string, otp: string): Promise<VerifyResetOTPResponse> {
    return this.post<VerifyResetOTPResponse>(api.auth.verifyResetOtp(), { email, otp });
  }

  async resetPassword(email: string, newPassword: string): Promise<ResetPasswordResponse> {
    return this.post<ResetPasswordResponse>(api.auth.resetPassword(), {
      email,
      new_password: newPassword,
    });
  }

  async getUserProfile(): Promise<UserProfileResponse> {
    return this.get<UserProfileResponse>(api.auth.me());
  }

  async changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> {
    return this.post<{ message: string }>(api.auth.changePassword(), {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    });
  }
}

export const authRepository = new AuthRepository();

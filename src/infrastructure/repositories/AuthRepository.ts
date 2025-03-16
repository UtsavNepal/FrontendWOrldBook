// AuthRepository.ts
import { BaseRepository } from "../base/BaseRepository";
import { User } from "../../core/domain/entities/User.entity";

// Define response types for each API method
export interface LoginResponse {
  access: string;
  refresh: string;
}

export interface SignupResponse {
  message: string;
}

export interface VerifyOTPResponse {
  message: string;
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
  email: string;
  firstname: string;
  lastname: string;
  birthday: string;
  gender: string;
}

export class AuthRepository extends BaseRepository<any> {
  constructor() {
    super("/api/auth"); // Base URL for authentication endpoints
  }

  // Signup: Send OTP to the user's email
  async signup(email: string): Promise<SignupResponse> {
    return this.post<SignupResponse>("/signup/", { email });
  }

  // Verify OTP: Validate the OTP sent to the user's email
  async verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
    return this.post<VerifyOTPResponse>("/verify-otp/", { email, otp });
  }

  // Complete Registration: Submit user details after OTP verification
  async completeRegistration(userData: User): Promise<CompleteRegistrationResponse> {
    return this.post<CompleteRegistrationResponse>("/complete-registration/", userData);
  }

  // Login: Authenticate the user and return access/refresh tokens
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.post<LoginResponse>("/login/", { email, password });
  }

  // Request Password Reset: Send OTP to reset the password
  async requestPasswordReset(email: string): Promise<RequestPasswordResetResponse> {
    return this.post<RequestPasswordResetResponse>("/request-password-reset/", { email });
  }

  // Verify Reset OTP: Validate the OTP for password reset
  async verifyResetOTP(email: string, otp: string): Promise<VerifyResetOTPResponse> {
    return this.post<VerifyResetOTPResponse>("/verify-reset-otp/", { email, otp });
  }

  // Reset Password: Update the user's password after OTP verification
  async resetPassword(email: string, newPassword: string): Promise<ResetPasswordResponse> {
    return this.post<ResetPasswordResponse>("/reset-password/", {
      email,
      new_password: newPassword,
    });
  }

  // Get User Profile: Fetch the logged-in user's profile data
  async getUserProfile(): Promise<UserProfileResponse> {
    return this.get<UserProfileResponse>("/api/user/");
  }
}

// Export an instance of AuthRepository
export const authRepository = new AuthRepository();
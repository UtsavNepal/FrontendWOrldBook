import { httpClient } from "../http/HttpClients";
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

export const AuthRepository = {
  // Signup: Send OTP to the user's email
  signup: async (email: string): Promise<SignupResponse> => {
    return httpClient.post<SignupResponse>("/api/auth/signup/", { email });
  },

  // Verify OTP: Validate the OTP sent to the user's email
  verifyOTP: async (email: string, otp: string): Promise<VerifyOTPResponse> => {
    return httpClient.post<VerifyOTPResponse>("/api/auth/verify-otp/", { email, otp });
  },

  // Complete Registration: Submit user details after OTP verification
  completeRegistration: async (
    userData: User
  ): Promise<CompleteRegistrationResponse> => {
    return httpClient.post<CompleteRegistrationResponse>(
      "/api/auth/complete-registration/",
      userData
    );
  },

  // Login: Authenticate the user and return access/refresh tokens
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return httpClient.post<LoginResponse>("/api/auth/login/", { email, password });
  },

  // Request Password Reset: Send OTP to reset the password
  requestPasswordReset: async (email: string): Promise<RequestPasswordResetResponse> => {
    return httpClient.post<RequestPasswordResetResponse>(
      "/api/auth/request-password-reset/",
      { email }
    );
  },

  // Verify Reset OTP: Validate the OTP for password reset
  verifyResetOTP: async (email: string, otp: string): Promise<VerifyResetOTPResponse> => {
    return httpClient.post<VerifyResetOTPResponse>("/api/auth/verify-reset-otp/", {
      email,
      otp,
    });
  },

  // Reset Password: Update the user's password after OTP verification
  resetPassword: async (
    email: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> => {
    return httpClient.post<ResetPasswordResponse>("/api/auth/reset-password/", {
      email,
      new_password: newPassword,
    });
  },

  // Get User Profile: Fetch the logged-in user's profile data
  getUserProfile: async (): Promise<UserProfileResponse> => {
    return httpClient.get<UserProfileResponse>("/api/user/");
  },
};
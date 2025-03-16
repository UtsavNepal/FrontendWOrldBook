// ProfileRepository.ts
import { BaseRepository } from "../base/BaseRepository";
import { Profile } from "../../core/domain/entities/Profile.entity";

export interface ProfileResponse {
  profile_picture: string;
  username: string;
  bio: string;
  total_posts: number;
  total_friends: number;
  posts: any[];
  tagged_posts: any[];
  reactions: any[];
  user: {
    email: string;
    gender: string;
    joined_at: string;
    birthday: string;
  };
}

export class ProfileRepository extends BaseRepository<ProfileResponse> {
  constructor() {
    super("/profile"); // Base URL for profile endpoints
  }

  // Fetch the logged-in user's profile
  async getProfile(): Promise<Profile> {
    try {
      const response = await this.get<ProfileResponse>("/");

      // Check if the response is valid
      if (!response || !response.user) {
        throw new Error("Invalid profile data received from the server");
      }

      return {
        ...response,
        user: {
          email: response.user.email,
          gender: response.user.gender,
          joined_at: response.user.joined_at,
          birthday: response.user.birthday,
        },
      };
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  // Update the logged-in user's profile
  async updateProfile(updatedData: Partial<Profile>): Promise<Profile> {
    try {
      const response = await this.patch<ProfileResponse>("/", updatedData);

      // Check if the response is valid
      if (!response || !response.user) {
        throw new Error("Invalid profile data received from the server");
      }

      return {
        ...response,
        user: {
          email: response.user.email,
          gender: response.user.gender,
          joined_at: response.user.joined_at,
          birthday: response.user.birthday,
        },
      };
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error; // Re-throw the error to be handled by the caller
    }
  }

  // Upload a new profile picture
  async uploadProfilePicture(file: File): Promise<Profile> {
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      const response = await this.patch<ProfileResponse>("/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Check if the response is valid
      if (!response || !response.user) {
        throw new Error("Invalid profile data received from the server");
      }

      return {
        ...response,
        user: {
          joined_at: response.user.joined_at,
          gender: response.user.gender,
          email: response.user.email,
          birthday: response.user.birthday,
        },
      };
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
      throw error; 
    }
  }

  // Delete the logged-in user's account
  async deleteAccount(): Promise<void> {
    try {
      await this.delete<void>("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      throw error;
    }
  }
}

// Export an instance of ProfileRepository
export const profileRepository = new ProfileRepository();
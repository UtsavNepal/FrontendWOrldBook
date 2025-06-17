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
    id:string;
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

      if (!response || !response.user) {
        throw new Error("Invalid profile data received from the server");
      }

      return {
        id: Number(response.user.id),
        ...response,
        post_photos: (response as any).post_photos ?? [],
        user: {
          id: Number(response.user.id),
          email: response.user.email,
          gender: response.user.gender,
          joined_at: response.user.joined_at,
          birthday: response.user.birthday,
        },
      };
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      throw error;
    }
  }

  // Update the logged-in user's profile
  async updateProfile(updatedData: Partial<Profile>): Promise<Profile> {
    try {
      const response = await this.patch<ProfileResponse>("/", updatedData);

      if (!response || !response.user) {
        throw new Error("Invalid profile data received from the server");
      }

      return {
        id: Number(response.user.id),
        ...response,
        post_photos: (response as any).post_photos ?? [],
        user: {
          id: Number(response.user.id),
          email: response.user.email,
          gender: response.user.gender,
          joined_at: response.user.joined_at,
          birthday: response.user.birthday,
        },
      };
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
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

      if (!response || !response.user) {
        throw new Error("Invalid profile data received from the server");
      }

      return {
        id: Number(response.user.id),
        ...response,
        post_photos: (response as any).post_photos ?? [],
        user: {
          id: Number(response.user.id),
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

  // Fetch a public profile by user ID
  async getPublicProfile(userId: string | number): Promise<any> {
    return this.get<any>(`/profiles/${userId}/public/`);
  }

  // Fetch followers for a user
  async getFollowers(userId: string | number): Promise<any[]> {
    return this.get<any[]>(`/profiles/${userId}/followers/`);
  }

  // Fetch following for a user
  async getFollowing(userId: string | number): Promise<any[]> {
    return this.get<any[]>(`/profiles/${userId}/following/`);
  }

  // Follow a user
  async followUser(userId: string | number): Promise<void> {
    await this.post(`/profiles/${userId}/follow/`);
  }

  // Unfollow a user
  async unfollowUser(userId: string | number): Promise<void> {
    await this.delete(`/profiles/${userId}/follow/`);
  }

  // Fetch notifications for the logged-in user
  async getNotifications(): Promise<any[]> {
    return this.get<any[]>("/notifications/");
  }
}

// Export an instance of ProfileRepository
export const profileRepository = new ProfileRepository();
import { httpClient } from "../http/HttpClients";
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

export const ProfileRepository = {
  // Fetch the logged-in user's profile
  getProfile: async (): Promise<Profile> => {
    const response = await httpClient.get<ProfileResponse[]>("/profile/");
    const profileData = response[0]; // Assuming the API returns an array with one profile object
    return {
      ...profileData,
      user: {
        email: profileData.user.email,
        gender: profileData.user.gender,
        joined_at: profileData.user.joined_at,
        birthday: profileData.user.birthday,
      },
    };
  },

  // Update the logged-in user's profile
  updateProfile: async (updatedData: Partial<Profile>): Promise<Profile> => {
    const response = await httpClient.patch<ProfileResponse>("/profile/", updatedData);
    return {
      ...response,
      user: {
        email: response.user.email,
        gender: response.user.gender,
        joined_at: response.user.joined_at,
        birthday: response.user.birthday,
      },
    };
  },

  // Upload a profile picture
  uploadProfilePicture: async (file: File): Promise<Profile> => {
    const formData = new FormData();
    formData.append("profile_picture", file);

    const response = await httpClient.patch<ProfileResponse>("/profile/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return {
      ...response,
      user: {
        email: response.user.email,
        gender: response.user.gender,
        joined_at: response.user.joined_at,
        birthday: response.user.birthday,
      },
    };
  },

  // Delete the logged-in user's account
  deleteAccount: async (): Promise<void> => {
    await httpClient.delete("/profile/");
  },
};
import { BaseRepository } from "../base/BaseRepository";
import { Profile } from "../../core/domain/entities/Profile.entity";
import { api } from "../../config/api";

export interface ProfileResponse {
  id: string;
  profile_picture: string;
  cover_photo?: string;
  username: string;
  bio: string;
  total_posts: number;
  total_friends: number;
  posts: any[];
  tagged_posts: any[];
  reactions: any[];
  post_photos?: any[];
  user: {
    id: string;
    email: string;
    gender: string;
    joined_at: string;
    birthday: string;
  };
}

function toProfile(response: ProfileResponse): Profile {
  return {
    ...response,
    id: String(response.id),
    post_photos: response.post_photos ?? [],
    user: {
      id: String(response.user.id),
      email: response.user.email,
      gender: response.user.gender,
      joined_at: response.user.joined_at,
      birthday: response.user.birthday,
    },
  };
}

export class ProfileRepository extends BaseRepository<ProfileResponse> {
  constructor() {
    super("");
  }

  async getProfile(): Promise<Profile> {
    const response = await this.get<ProfileResponse>(api.profile.me());
    if (!response || !response.user) {
      throw new Error("Invalid profile data received from the server");
    }
    return toProfile(response);
  }

  async updateProfile(updatedData: Partial<Profile>): Promise<Profile> {
    const response = await this.patch<ProfileResponse>(api.profile.root(), updatedData);
    if (!response || !response.user) {
      throw new Error("Invalid profile data received from the server");
    }
    return toProfile(response);
  }

  async uploadProfilePicture(file: File): Promise<Profile> {
    const formData = new FormData();
    formData.append("profile_picture", file);
    const response = await this.post<ProfileResponse>(api.uploads.profilePicture(), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!response || !response.user) {
      throw new Error("Invalid profile data received from the server");
    }
    return toProfile(response);
  }

  async uploadCoverPhoto(file: File): Promise<Profile> {
    const formData = new FormData();
    formData.append("cover_photo", file);
    const response = await this.post<ProfileResponse>(api.uploads.coverPhoto(), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!response || !response.user) {
      throw new Error("Invalid profile data received from the server");
    }
    return toProfile(response);
  }

  async deleteAccount(): Promise<void> {
    await this.delete<void>(api.profile.root());
  }

  async getPublicProfile(userId: string | number): Promise<any> {
    return this.get<any>(api.profile.public(userId));
  }

  async getFollowers(userId: string | number): Promise<any[]> {
    return this.get<any[]>(api.profile.followers(userId));
  }

  async getFollowing(userId: string | number): Promise<any[]> {
    return this.get<any[]>(api.profile.following(userId));
  }

  async followUser(userId: string | number): Promise<void> {
    await this.post(api.profile.follow(userId));
  }

  async unfollowUser(userId: string | number): Promise<void> {
    await this.delete(api.profile.follow(userId));
  }

  async getNotifications(): Promise<any[]> {
    return this.get<any[]>(api.notifications.list());
  }

  async getFriends(): Promise<any[]> {
    return this.get<any[]>(api.friends.list());
  }

  async removeProfilePicture(): Promise<Profile> {
    const response = await this.patch<ProfileResponse>(api.profile.root(), { profile_picture: null });
    if (!response || !response.user) {
      throw new Error("Invalid profile data received from the server");
    }
    return toProfile(response);
  }

  async removeCoverPhoto(): Promise<Profile> {
    const response = await this.patch<ProfileResponse>(api.profile.root(), { cover_photo: null });
    if (!response || !response.user) {
      throw new Error("Invalid profile data received from the server");
    }
    return toProfile(response);
  }

  async getFriendsForUser(profileId: string | number): Promise<any[]> {
    return this.get<any[]>(api.profile.friends(profileId));
  }

  async markNotificationRead(id: string | number): Promise<any> {
    return this.patch<any>(api.notifications.byId(id), { is_read: true });
  }

  async markAllNotificationsRead(): Promise<any> {
    return this.patch<any>(api.notifications.list(), { all_read: true });
  }

  async deleteNotification(id: string | number): Promise<any> {
    return this.delete(api.notifications.byId(id));
  }

  async markNotificationUnread(id: string | number): Promise<any> {
    return this.patch<any>(api.notifications.byId(id), { is_read: false });
  }
}

export const profileRepository = new ProfileRepository();

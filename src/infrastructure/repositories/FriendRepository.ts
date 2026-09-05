import { BaseRepository } from "../base/BaseRepository";
import { FriendRequest } from "../../core/domain/entities/Friend.entity";
import { Profile } from "../../core/domain/entities/Profile.entity";
import { api } from "../../config/api";

export class FriendRepository extends BaseRepository<FriendRequest> {
  constructor() {
    super("");
  }

  async getOtherUsersProfiles(): Promise<Profile[]> {
    return this.get<Profile[]>(api.users.others());
  }

  async getFriends(): Promise<any[]> {
    return this.get<any[]>(api.friends.list());
  }

  async getFriendRequests(): Promise<FriendRequest[]> {
    return this.get<FriendRequest[]>(api.friends.requests());
  }

  async sendFriendRequest(userId: string | number): Promise<FriendRequest> {
    return this.post<FriendRequest>(api.friends.requests(), { to_user_id: String(userId) });
  }

  async acceptFriendRequest(requestId: string | number): Promise<FriendRequest> {
    return this.post<FriendRequest>(api.friends.accept(), { request_id: String(requestId) });
  }

  async rejectFriendRequest(requestId: string | number): Promise<void> {
    return this.post<void>(api.friends.reject(), { request_id: String(requestId) });
  }

  async unfriend(userId: string | number): Promise<void> {
    return this.post<void>(api.friends.delete(), { friend_id: String(userId) });
  }

  async listSentFriendRequests(): Promise<FriendRequest[]> {
    return this.get<FriendRequest[]>(api.friends.sent());
  }

  async listFriendRequests(): Promise<FriendRequest[]> {
    return this.get<FriendRequest[]>(api.friends.requests());
  }

  async cancelFriendRequest(requestId: string | number): Promise<void> {
    return this.delete<void>(api.friends.cancel(requestId));
  }
}

export const friendRepository = new FriendRepository();

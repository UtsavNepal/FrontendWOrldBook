import { BaseRepository } from "../base/BaseRepository";
import { FriendRequest } from "../../core/domain/entities/Friend.entity";
import { Profile } from "../../core/domain/entities/Profile.entity";

export class FriendRepository extends BaseRepository<FriendRequest> {
  constructor() {
    super("/profile");
  }

 
  async getOtherUsersProfiles(): Promise<Profile[]> {
    return this.get<Profile[]>("/other-users-profiles/");
  }

  async getFriends(): Promise<Profile[]> {
    return this.get<Profile[]>("/list-friends/");
  }

  async sendFriendRequest(toUserId: string): Promise<void> {
    return this.post("/send-friend-request/", { to_user_id: toUserId });
  }

  async acceptFriendRequest(requestId: string): Promise<void> {
    return this.post("/accept-friend-request/", { request_id: requestId });
  }

  async rejectFriendRequest(requestId: string): Promise<void> {
    return this.post("/reject-friend-request/", { request_id: requestId });
  }

  async unfriend(userId: string | number): Promise<void> {
    await this.post('/delete-friend/', { friend_id: userId });
  }

  async listSentFriendRequests(): Promise<FriendRequest[]> {
    return this.get<FriendRequest[]>("/list-sent-friend-requests/");
  }

  async listFriendRequests(): Promise<FriendRequest[]> {
    return this.get<FriendRequest[]>("/list-friend-requests/");
  }

  async cancelSentFriendRequest(requestId: string): Promise<void> {
    return this.delete(`/cancel-friend-request/${requestId}/`);
  }
}

export const friendRepository = new FriendRepository();
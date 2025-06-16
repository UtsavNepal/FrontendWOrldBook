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

  async getFriends(): Promise<FriendRequest[]> {
    return this.get<FriendRequest[]>("/list-friends/");
  }

  async getFriendRequests(): Promise<FriendRequest[]> {
    return this.get<FriendRequest[]>("/list-friend-requests/");
  }

  async sendFriendRequest(userId: string | number): Promise<FriendRequest> {
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    
    // Check if a friend request has already been sent
    const sentRequests = await this.listSentFriendRequests();
    const hasSentRequest = sentRequests.some(request => request.to_user.id === numericUserId);
    
    if (hasSentRequest) {
      throw new Error('Friend request already sent.');
    }
    
    return this.post<FriendRequest>("/send-friend-request/", { to_user_id: numericUserId });
  }

  async acceptFriendRequest(requestId: number): Promise<FriendRequest> {
    return this.post<FriendRequest>("/accept-friend-request/", { request_id: requestId });
  }

  async rejectFriendRequest(requestId: number): Promise<void> {
    return this.post<void>("/reject-friend-request/", { request_id: requestId });
  }

  async unfriend(userId: string | number): Promise<void> {
    const numericUserId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    return this.post<void>("/delete-friend/", { friend_id: numericUserId });
  }

  async listSentFriendRequests(): Promise<FriendRequest[]> {
    return this.get<FriendRequest[]>("/list-sent-friend-requests/");
  }

  async listFriendRequests(): Promise<FriendRequest[]> {
    return this.get<FriendRequest[]>("/list-friend-requests/");
  }

  async cancelFriendRequest(requestId: number): Promise<void> {
    return this.delete<void>(`/cancel-friend-request/${requestId}/`);
  }
}

export const friendRepository = new FriendRepository();
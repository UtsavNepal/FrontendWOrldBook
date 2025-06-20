import React, { createContext, useContext, useState, ReactNode } from "react";
import { FriendRepository } from "../../../infrastructure/repositories/FriendRepository";
import { FriendRequest } from "../../domain/entities/Friend.entity";
import { Profile } from "../../domain/entities/Profile.entity";
import { useAuth } from "./AuthContext";

interface FriendContextType {
  friendRequests: FriendRequest[];
  otherUsers: Profile[];
  acceptFriendRequest: (requestId: number) => Promise<void>;
  rejectFriendRequest: (requestId: number) => Promise<void>;
  sendFriendRequest: (toUserId: number) => Promise<void>;
  isRequestSent: (userId: number) => boolean;
  isRequestReceived: (userId: number) => boolean;
  getFriendRequests: () => Promise<void>;
  fetchOtherUsersProfiles: () => Promise<void>;
  unfriend: (userId: number) => Promise<void>;
}

interface FriendProviderProps {
  children: ReactNode;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export const FriendProvider: React.FC<FriendProviderProps> = ({ children }) => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [otherUsers, setOtherUsers] = useState<Profile[]>([]);
  const friendRepository = new FriendRepository();
  const { user } = useAuth();

  const getFriendRequests = async () => {
    const requests = await friendRepository.listFriendRequests();
    setFriendRequests(requests);
  };

  const fetchOtherUsersProfiles = async () => {
    const users = await friendRepository.getOtherUsersProfiles();
    setOtherUsers(users);
  };

  const acceptFriendRequest = async (requestId: number) => {
    await friendRepository.acceptFriendRequest(requestId);
    setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const rejectFriendRequest = async (requestId: number) => {
    await friendRepository.rejectFriendRequest(requestId);
    setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const sendFriendRequest = async (toUserId: number) => {
    await friendRepository.sendFriendRequest(toUserId);
    // Fetch the real friend requests from the backend
    await getFriendRequests();
  };

  const unfriend = async (userId: number) => {
    await friendRepository.unfriend(userId);
  };

  // Check if a request has been sent to a specific user
  const isRequestSent = (userId: number): boolean => {
    if (!user) return false;
    return friendRequests.some(
      (request) => request.from_user.id === user.id && request.to_user.id === userId
    );
  };

  // Check if a request has been received from a specific user
  const isRequestReceived = (userId: number): boolean => {
    if (!user) return false;
    return friendRequests.some(
      (request) => request.to_user.id === user.id && request.from_user.id === userId
    );
  };

  return (
    <FriendContext.Provider
      value={{
        friendRequests,
        otherUsers,
        acceptFriendRequest,
        rejectFriendRequest,
        sendFriendRequest,
        isRequestSent,
        isRequestReceived,
        getFriendRequests,
        fetchOtherUsersProfiles,
        unfriend
      }}
    >
      {children}
    </FriendContext.Provider>
  );
};

export const useFriendContext = () => {
  const context = useContext(FriendContext);
  if (!context) {
    throw new Error("useFriendContext must be used within a FriendProvider");
  }
  return context;
};
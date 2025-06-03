import React, { createContext, useContext, useState, ReactNode } from "react";
import { FriendRepository } from "../../../infrastructure/repositories/FriendRepository";
import { FriendRequest } from "../../domain/entities/Friend.entity";
import { Profile } from "../../domain/entities/Profile.entity";
import { useAuth } from "./AuthContext";

interface FriendContextType {
  friendRequests: FriendRequest[];
  otherUsers: Profile[];
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  sendFriendRequest: (toUserId: string) => Promise<void>;
  isRequestSent: (userId: string) => boolean;
  isRequestReceived: (userId: string) => boolean;
  getFriendRequests: () => Promise<void>;
  fetchOtherUsersProfiles: () => Promise<void>;
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

  const acceptFriendRequest = async (requestId: string) => {
    await friendRepository.acceptFriendRequest(requestId);
    setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const rejectFriendRequest = async (requestId: string) => {
    await friendRepository.rejectFriendRequest(requestId);
    setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const sendFriendRequest = async (toUserId: string) => {
    await friendRepository.sendFriendRequest(toUserId);
    // Fetch the real friend requests from the backend
    await getFriendRequests();
  };

  // Check if a request has been sent to a specific user
  const isRequestSent = (userId: string): boolean => {
    if (!user) return false;
    return friendRequests.some(
      (request) => request.from_user.id === user.id && request.to_user.id === userId
    );
  };

  // Check if a request has been received from a specific user
  const isRequestReceived = (userId: string): boolean => {
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
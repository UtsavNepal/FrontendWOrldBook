import React, { createContext, useContext, useState, ReactNode } from "react";
import { FriendRepository } from "../../../infrastructure/repositories/FriendRepository";
import { FriendRequest } from "../../domain/entities/Friend.entity";
import { Profile } from "../../domain/entities/Profile.entity";
import { useAuth } from "./AuthContext";
import { refersTo } from "../../../utils/friendStatus";
import { ERRORS } from "../../../constants/errors";

interface FriendContextType {
  friendRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  otherUsers: Profile[];
  acceptFriendRequest: (requestId: string) => Promise<void>;
  rejectFriendRequest: (requestId: string) => Promise<void>;
  sendFriendRequest: (toUserId: string) => Promise<FriendRequest | void>;
  cancelFriendRequest: (requestId: string) => Promise<void>;
  isRequestSent: (userId: string) => boolean;
  isRequestReceived: (userId: string) => boolean;
  getFriendRequests: () => Promise<void>;
  getSentFriendRequests: () => Promise<void>;
  fetchOtherUsersProfiles: () => Promise<void>;
  unfriend: (userId: string) => Promise<void>;
}

interface FriendProviderProps {
  children: ReactNode;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export const FriendProvider: React.FC<FriendProviderProps> = ({ children }) => {
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [otherUsers, setOtherUsers] = useState<Profile[]>([]);
  const friendRepository = new FriendRepository();
  const { user } = useAuth();

  const getFriendRequests = async () => {
    const requests = await friendRepository.listFriendRequests();
    setFriendRequests(requests);
  };

  const getSentFriendRequests = async () => {
    const requests = await friendRepository.listSentFriendRequests();
    setSentRequests(requests);
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
    const created = await friendRepository.sendFriendRequest(toUserId);
    setSentRequests((prev) =>
      prev.some((request) => String(request.id) === String(created.id))
        ? prev
        : [...prev, created]
    );
    return created;
  };

  const cancelFriendRequest = async (requestId: string) => {
    setSentRequests((prev) => prev.filter((request) => String(request.id) !== String(requestId)));
    try {
      await friendRepository.cancelFriendRequest(requestId);
    } catch (error) {
      await getSentFriendRequests();
      throw error;
    }
  };

  const unfriend = async (userId: string) => {
    await friendRepository.unfriend(userId);
  };

  const isRequestSent = (userId: string): boolean => {
    return sentRequests.some((request) => refersTo(request.to_user, userId));
  };

  const isRequestReceived = (userId: string): boolean => {
    return friendRequests.some((request) => refersTo(request.from_user, userId));
  };

  return (
    <FriendContext.Provider
      value={{
        friendRequests,
        sentRequests,
        otherUsers,
        acceptFriendRequest,
        rejectFriendRequest,
        sendFriendRequest,
        cancelFriendRequest,
        isRequestSent,
        isRequestReceived,
        getFriendRequests,
        getSentFriendRequests,
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
    throw new Error(ERRORS.friend.providerRequired);
  }
  return context;
};
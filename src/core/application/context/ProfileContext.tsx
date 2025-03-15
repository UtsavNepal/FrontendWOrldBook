import { createContext, useContext, ReactNode, useState } from "react";
import { Profile } from "../../domain/entities/Profile.entity";
import { ProfileRepository } from "../../../infrastructure/repositories/ProfileRepository";

interface ProfileContextType {
  profile: Profile | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (updatedData: Partial<Profile>) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async () => {
    try {
      const profileData = await ProfileRepository.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const updateProfile = async (updatedData: Partial<Profile>) => {
    try {
      const updatedProfile = await ProfileRepository.updateProfile(updatedData);
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      const updatedProfile = await ProfileRepository.uploadProfilePicture(file);
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
    }
  };

  const deleteAccount = async () => {
    try {
      await ProfileRepository.deleteAccount();
      setProfile(null); // Clear profile data after deletion
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        fetchProfile,
        updateProfile,
        uploadProfilePicture,
        deleteAccount,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
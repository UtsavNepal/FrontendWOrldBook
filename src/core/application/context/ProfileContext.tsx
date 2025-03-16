import { createContext, useContext, ReactNode, useState } from "react";
import { Profile } from "../../domain/entities/Profile.entity";
import { ProfileRepository } from "../../../infrastructure/repositories/ProfileRepository";

// Define the context type
interface ProfileContextType {
  profile: Profile | null;
  fetchProfile: () => Promise<void>;
  updateProfile: (updatedData: Partial<Profile>) => Promise<void>;
  uploadProfilePicture: (file: File) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

// Create the context
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Custom hook to use the ProfileContext
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

// ProfileProvider component
export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile | null>(null);

  // Instantiate the ProfileRepository
  const profileRepository = new ProfileRepository();

  // Fetch the logged-in user's profile
  const fetchProfile = async () => {
    try {
      const profileData = await profileRepository.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setProfile(null); // Reset profile state on error
    }
  };

  // Update the logged-in user's profile
  const updateProfile = async (updatedData: Partial<Profile>) => {
    try {
      const updatedProfile = await profileRepository.updateProfile(updatedData);
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  // Upload a profile picture
  const uploadProfilePicture = async (file: File) => {
    try {
      const updatedProfile = await profileRepository.uploadProfilePicture(file);
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Failed to upload profile picture:", error);
    }
  };

  // Delete the logged-in user's account
  const deleteAccount = async () => {
    try {
      await profileRepository.deleteAccount();
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
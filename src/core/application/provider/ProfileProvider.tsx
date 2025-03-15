// import React, { useState, useEffect } from "react";
// import { ProfileContext } from "../context/ProfileContext";
// import { ProfileRepository } from "../../../infrastructure/repositories/ProfileRepository";
// import { httpClient } from "../../../infrastructure/http/HttpClients";
// import { Profile } from "../../domain/entities/Profile.entity";
// import { useAuth } from "./AuthProvider"; // Import useAuth to check authentication state
// import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

// const profileRepository = new ProfileRepository(httpClient); // Pass the httpClient instance

// export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const { isAuthenticated } = useAuth(); // Get authentication state
//   const navigate = useNavigate(); // For redirection

//   // Fetch the profile data
//   const fetchProfile = async () => {
//     if (!isAuthenticated) {
//       console.error("User is not authenticated. Redirecting to login...");
//       navigate("/login"); // Redirect to login page
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const data = await profileRepository.getProfile();
//       setProfile(data);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update the profile data
//   const updateProfile = async (data: Partial<Profile>) => {
//     if (!isAuthenticated) {
//       console.error("User is not authenticated. Redirecting to login...");
//       navigate("/login"); // Redirect to login page
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const updatedProfile = await profileRepository.updateProfile(data);
//       setProfile(updatedProfile);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to update profile");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch the profile when the component mounts (only if authenticated)
//   useEffect(() => {
//     if (isAuthenticated) {
//       fetchProfile();
//     } else {
//       navigate("/login"); // Redirect to login page if not authenticated
//     }
//   }, [isAuthenticated, navigate]);

//   return (
//     <ProfileContext.Provider value={{ profile, loading, error, fetchProfile, updateProfile }}>
//       {children}
//     </ProfileContext.Provider>
//   );
// };
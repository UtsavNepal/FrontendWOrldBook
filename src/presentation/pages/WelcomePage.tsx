import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/application/context/AuthContext";
import { useProfile } from "../../core/application/context/ProfileContext";
import { Profile } from "../../core/domain/entities/Profile.entity";

// Backend base URL
const BACKEND_BASE_URL = "http://127.0.0.1:8000";

export const WelcomePage = () => {
  const { isAuthenticated, logout } = useAuth();
  const { profile, fetchProfile, updateProfile, uploadProfilePicture, deleteAccount } = useProfile();
  const [editMode, setEditMode] = useState<"username" | "profile_picture" | "bio" | "gender" | null>(null);
  const [updatedUsername, setUpdatedUsername] = useState("");
  const [updatedProfilePicture, setUpdatedProfilePicture] = useState<File | null>(null);
  const [updatedBio, setUpdatedBio] = useState("");
  const [updatedGender, setUpdatedGender] = useState("");
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    } else {
      fetchProfile();
    }
  }, [isAuthenticated, navigate, fetchProfile]);

  const handleUpdateProfile = async () => {
    try {
      let updatedData: Partial<Profile> = {};
      switch (editMode) {
        case "username":
          updatedData = { username: updatedUsername };
          break;
        case "profile_picture":
          if (updatedProfilePicture) {
            await uploadProfilePicture(updatedProfilePicture);
          }
          return;
        case "bio":
          updatedData = { bio: updatedBio };
          break;
        case "gender":
          updatedData = { user: { ...profile!.user, gender: updatedGender } };
          break;
        default:
          return;
      }
      await updateProfile(updatedData);
      setEditMode(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      await deleteAccount();
      logout();
      navigate("/login");
    }
  };

  if (!isAuthenticated) {
    return null; // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to the Application!</h1>
        {profile && (
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              {/* Construct the full image URL */}
              <img
                src={`${BACKEND_BASE_URL}${profile.profile_picture}`}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
              />
              <h2 className="text-2xl font-semibold mt-4">Your Profile</h2>
            </div>

            <div className="space-y-4">
              <p className="text-lg">
                <span className="font-semibold">Username:</span> {profile.username}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Bio:</span> {profile.bio}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Gender:</span> {profile.user.gender}
              </p>
            </div>

            {/* Edit Options */}
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => setEditMode("username")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Username
              </button>
              <button
                onClick={() => setEditMode("profile_picture")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Profile Picture
              </button>
              <button
                onClick={() => setEditMode("bio")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Bio
              </button>
              <button
                onClick={() => setEditMode("gender")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Gender
              </button>
            </div>

            {/* Edit Forms */}
            {editMode === "username" && (
              <div className="space-y-4">
                <input
                  type="text"
                  value={updatedUsername}
                  onChange={(e) => setUpdatedUsername(e.target.value)}
                  placeholder="Enter new username"
                  className="w-full p-2 border rounded"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditMode(null)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {editMode === "profile_picture" && (
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUpdatedProfilePicture(e.target.files[0]);
                    }
                  }}
                  className="w-full p-2 border rounded"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditMode(null)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {editMode === "bio" && (
              <div className="space-y-4">
                <textarea
                  value={updatedBio}
                  onChange={(e) => setUpdatedBio(e.target.value)}
                  placeholder="Enter new bio"
                  className="w-full p-2 border rounded"
                />
                <div className="flex space-x-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditMode(null)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            {editMode === "gender" && (
              <div className="space-y-4">
                <select
                  value={updatedGender}
                  onChange={(e) => setUpdatedGender(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <div className="flex space-x-4">
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditMode(null)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Account Center */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Account Center</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Personal Details</h3>
                <p className="text-lg">
                  <span className="font-semibold">Email:</span> {profile.user.email}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Date of Birth:</span> {profile.user.birthday}
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="mt-8 text-center">
          <button
            onClick={logout}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
// import React, { useState } from "react";
// import { Profile } from "../../core/domain/entities/Profile.entity";

// interface EditProfileFormProps {
//   profile: Profile;
//   onUpdate: (data: Partial<Profile>) => Promise<void>;
// }

// export const EditProfileForm: React.FC<EditProfileFormProps> = ({ profile, onUpdate }) => {
//   const [formData, setFormData] = useState<Partial<Profile>>({
//     profile_picture: profile.profile_picture,
//     username: profile.username,
//     bio: profile.bio,
//   });

//   const [error, setError] = useState<string | null>(null);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await onUpdate(formData);
//       setError(null); // Clear any previous errors
//     } catch (err) {
//       setError("Failed to update profile. Please try again.");
//       console.error("Update error:", err);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="mt-4">
//       <div className="space-y-4">
//         <input
//           type="text"
//           placeholder="Profile Picture URL"
//           value={formData.profile_picture || ""}
//           onChange={(e) => setFormData({ ...formData, profile_picture: e.target.value })}
//           className="w-full p-2 border rounded"
//         />
//         <input
//           type="text"
//           placeholder="Username"
//           value={formData.username || ""}
//           onChange={(e) => setFormData({ ...formData, username: e.target.value })}
//           className="w-full p-2 border rounded"
//         />
//         <textarea
//           placeholder="Bio"
//           value={formData.bio || ""}
//           onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
//           className="w-full p-2 border rounded"
//         />
//         {error && <p className="text-red-500">{error}</p>}
//         <button type="submit" className="bg-blue-500 text-white p-2 rounded">
//           Update Profile
//         </button>
//       </div>
//     </form>
//   );
// };
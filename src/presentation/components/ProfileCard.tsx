// import React from "react";
// import { Profile } from "../../core/domain/entities/Profile.entity";

// interface ProfileCardProps {
//   profile: Profile;
// }

// export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <div className="flex items-center space-x-4">
//         <img
//           src={profile.profile_picture || "https://via.placeholder.com/150"} // Fallback for missing image
//           alt="Profile"
//           className="w-24 h-24 rounded-full object-cover"
//         />
//         <div>
//           <h2 className="text-xl font-bold">{profile.username}</h2>
//           <p className="text-gray-600">{profile.bio}</p>
//         </div>
//       </div>
//       <div className="mt-4">
//         <p>Email: {profile.user.email}</p> {/* Assuming email is directly on the profile object */}
//         <p>Gender: {profile.user.gender}</p> {/* Assuming gender is directly on the profile object */}
//         <p>Joined: {new Date(profile.user.joined_at).toLocaleDateString()}</p>
//         <p>Birthday: {new Date(profile.user.birthday).toLocaleDateString()}</p>
//       </div>
//     </div>
//   );
// };
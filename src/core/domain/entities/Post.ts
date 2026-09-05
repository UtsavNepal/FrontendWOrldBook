export interface Profile {
  username: string;
  profile_picture: string;
  user: {
    id: string;
  };
}

export interface Comment {
  id: string;
  profile: Profile; 
  comment: string; 
  created_at: string;
  replies?: Comment[];
}
export interface Post {
  id: string;
  content: string;
  image?: string;
  images?: string[];
  created_at: string;
  tagged_profiles: Profile[];
  updated_at: string;
  profile: Profile;
  likes: number;
  is_liked?: boolean;
  comments: Comment[]; 
  visibility: string;
  post_type?: "status" | "profile_picture" | "cover_photo";
}
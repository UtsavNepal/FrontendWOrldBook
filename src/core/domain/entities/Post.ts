export interface Profile {
  username: string;
  profile_picture: string;
  user: {
    id: number;
  };
}

export interface Comment {
  id: number;
  profile: Profile; 
  comment: string; 
  created_at: string;
  replies?: Comment[];
}
export interface Post {
  id: number;
  content: string;
  image?: string;
  created_at: string;
  tagged_profiles: Profile[];
  updated_at: string;
  profile: Profile;
  likes: number;
  comments: Comment[]; 
  visibility: string;
}
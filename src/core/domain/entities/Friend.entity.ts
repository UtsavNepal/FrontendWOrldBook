export interface User {
  id: number;
  firstname: string;
  lastname: string;
  joined_at: string;
  gender: string;
  email: string;
  birthday: string;
}

export interface Profile {
  id: number;
  profile_picture: string;
  username: string;
  bio: string | null;
  total_posts: number;
  total_friends: number;
  posts: number[];
  tagged_posts: number[];
  user: User;
}

export interface FriendRequest {
  id: number;
  from_user: Profile;
  to_user: Profile;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}
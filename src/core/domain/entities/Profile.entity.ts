export interface Profile {
    id: number;
    profile_picture: string;
    username: string;
    bio: string;
    total_posts: number;
    total_friends: number;
    posts: any[];
    tagged_posts: any[];
    reactions: any[];
    user: {
    
      joined_at: string;
      gender: string;
      email: string;
      birthday: string;
    };
    friends?: any[];
    total_followers?: number;
    total_following?: number;
    is_friend?: boolean;
  }
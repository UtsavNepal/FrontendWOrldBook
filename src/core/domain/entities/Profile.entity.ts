export interface Profile {
    profile_picture: string;
    username: string;
    bio: string;
    total_posts: number;
    total_friends: number;
    posts: any[];
    tagged_posts: any[];
    reactions: any[];
    user: {
      email: string;
      gender: string;
      joined_at: string;
      birthday: string;
    };
  }
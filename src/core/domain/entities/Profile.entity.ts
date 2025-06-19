export interface Profile {
    id: number;
    profile_picture?: string;
    cover_photo?: string;
    username?: string;
    bio?: string;
    total_posts?: number;
    total_friends?: number;
    posts?: any[];
    tagged_posts?: any[];
    reactions?: any[];
    post_photos: any[];
    user: {
      id: number;
      joined_at: string;
      gender: string;
      email: string;
      birthday: string;
    };
    friends?: {
      id: number;
      user: {
        id: number;
      };
    }[];
    total_followers?: number;
    total_following?: number;
    is_friend?: boolean;
  }
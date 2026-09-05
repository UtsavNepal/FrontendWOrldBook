export interface Profile {
    id: string;
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
      id: string;
      joined_at: string;
      gender: string;
      email: string;
      birthday: string;
    };
    friends?: {
      id: string;
      user: {
        id: string;
      };
    }[];
    total_followers?: number;
    total_following?: number;
    is_friend?: boolean;
    friend_request_sent?: boolean;
    friend_request_received?: boolean;
    friend_request_id?: string | null;
  }

export interface Profile {
    username: string;
    profile_picture: string;
    user: {
      id: number;
    };
  }

export interface Post {
    id: number;
    content: string;
    image?: string;
    created_at: string;
    updated_at: string;
    profile: Profile;
    likes: number;
    comments: Comment[];
  }
  
  export interface Comment {
    id: number;
    content: string;
    created_at: string;
    profile: {
      username: string;
      profile_picture: string;
    };
  }
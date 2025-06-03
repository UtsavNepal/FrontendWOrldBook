export interface FriendRequest {
  id: string;
  from_user: {
    id: string;
    username: string;
  };
  to_user: {
    id: string;
    username: string;
  };
  status: "pending" | "accepted" | "rejected";
  created_at: string;
}
export const backendUrl = import.meta.env.VITE_BACKEND_URL;

if (!backendUrl) {
  throw new Error("VITE_BACKEND_URL is missing from the frontend .env file");
}

export const api = {
  auth: {
    login: () => "/api/auth/login",
    signupStart: () => "/api/auth/signup/start",
    verifyOtp: () => "/api/auth/signup/verify-otp",
    completeRegistration: () => "/api/auth/signup/complete-registration",
    me: () => "/api/auth/me",
    refresh: () => "/api/auth/refresh",
    requestPasswordReset: () => "/api/auth/request-password-reset",
    verifyResetOtp: () => "/api/auth/verify-reset-otp",
    resetPassword: () => "/api/auth/reset-password",
    changePassword: () => "/api/auth/change-password",
  },
  users: {
    list: () => "/api/user",
    search: (query: string) => `/api/user/search?q=${encodeURIComponent(query)}`,
    others: () => "/api/user/others",
  },
  profile: {
    root: () => "/api/profile",
    me: () => "/api/profile/me",
    public: (id: string | number) => `/api/profile/${id}/public`,
    followers: (id: string | number) => `/api/profile/${id}/followers`,
    following: (id: string | number) => `/api/profile/${id}/following`,
    follow: (id: string | number) => `/api/profile/${id}/follow`,
    friends: (id: string | number) => `/api/profile/${id}/friends`,
  },
  posts: {
    list: () => "/api/post",
    feed: () => "/api/post/feed",
    byId: (id: string | number) => `/api/post/${id}`,
    like: (id: string | number) => `/api/post/${id}/like`,
    comments: (id: string | number) => `/api/post/${id}/comments`,
  },
  comments: {
    byId: (id: string | number) => `/api/comment/${id}`,
  },
  friends: {
    list: () => "/api/friends",
    delete: () => "/api/friends/delete",
    requests: () => "/api/friend-request",
    sent: () => "/api/friend-request/sent",
    accept: () => "/api/friend-request/accept",
    reject: () => "/api/friend-request/reject",
    cancel: (id: string | number) => `/api/friend-request/cancel/${id}`,
  },
  chat: {
    conversations: () => "/api/conversation",
    conversationById: (id: string | number) => `/api/conversation/${id}`,
    messages: (conversationId?: string | number) =>
      conversationId ? `/api/message?conversation=${conversationId}` : "/api/message",
    reactions: (messageId?: string | number) =>
      messageId ? `/api/reaction?message=${messageId}` : "/api/reaction",
  },
  notifications: {
    list: () => "/api/notification",
    byId: (id: string | number) => `/api/notification/${id}`,
  },
  uploads: {
    profilePicture: () => "/api/upload/profile-picture",
    coverPhoto: () => "/api/upload/cover-photo",
  },
};

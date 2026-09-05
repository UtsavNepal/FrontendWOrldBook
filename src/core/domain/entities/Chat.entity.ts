export interface Profile {
  id?: string;
  username: string;
  profile_picture: string;
  user: {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    joined_at: string;
    gender: string;
    birthday: string;
  };
}

export interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  profile: Profile[];
  
}

export interface Reaction {
  id: string;
  user: User;
  message: string; 
  emoji: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: User;
  text?: string;
  image?: string; // URL to the image
  gif_url?: string;
  created_at: string;
  updated_at: string;
  deleted: boolean;
  reactions: Reaction[];
}

export interface Conversation {
  id: string;
  name?: string;
  is_group: boolean;
  participants: User[];
  participant_ids?: string[];
  messages: Message[];
  created_at: string;
  updated_at: string;
  request_status?: "pending" | "accepted" | "declined";
  requested_by?: string | null;
  is_message_request?: boolean;
}

// Additional interfaces for frontend state management
export interface ChatState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  messages: Message[];
  users: User[];
  profile: Profile[];
  loading: boolean;
  error: string | null;
}

// Payload types for API calls
export interface CreateConversationPayload {
  participants: string[];
  name?: string;
  is_group?: boolean;
}

export interface SendMessagePayload {
  conversationId: string;
  text?: string;
  image?: File | null;
  gif_url?: string;
}

export interface AddReactionPayload {
  messageId: string;
  emoji: string;
}

// Context type for React context
export interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  createConversation: (payload: CreateConversationPayload) => Promise<void>;
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  addReaction: (payload: AddReactionPayload) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  setCurrentConversation: (conversationId: string | null) => void;
  fetchConversations: () => Promise<void>;
}
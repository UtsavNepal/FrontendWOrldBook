export interface Profile {
  id?: number;
  username: string;
  profile_picture: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    joined_at: string;
    gender: string;
    birthday: string;
  };
}

export interface User {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  profile: Profile[];
  
}

export interface Reaction {
  id: number;
  user: User;
  message: number; 
  emoji: string;
  created_at: string;
}

export interface Message {
  id: number;
  conversation: number; // conversation ID
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
  id: number;
  name?: string;
  is_group: boolean;
  participants: User[];
  participant_ids?: number[]; // write-only for creation
  messages: Message[];
  created_at: string;
  updated_at: string;
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
  participants: number[];
  name?: string;
  is_group?: boolean;
}

export interface SendMessagePayload {
  conversationId: number;
  text?: string;
  image?: File | null;
  gif_url?: string;
}

export interface AddReactionPayload {
  messageId: number;
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
  deleteMessage: (messageId: number) => Promise<void>;
  deleteConversation: (conversationId: number) => Promise<void>;
  setCurrentConversation: (conversationId: number | null) => void;
  fetchConversations: () => Promise<void>;
}
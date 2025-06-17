import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import ChatRepository from "../../../infrastructure/repositories/ChatRepository";
import { 
  ChatState, 
  Conversation, 
  User, 
  SendMessagePayload, 
  CreateConversationPayload, 
  Profile
} from "../../domain/entities/Chat.entity";

interface ChatContextType extends ChatState {
  fetchConversations: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  selectConversation: (conversation: Conversation) => Promise<void>;
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  createConversation: (payload: CreateConversationPayload) => Promise<Conversation>;
  deleteConversation: (id: number) => Promise<void>;
  reactToMessage: (messageId: number, emoji: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<ChatState>({
    conversations: [],
    selectedConversation: null,
    messages: [],
    users: [],
    profile: [],
    loading: false,
    error: null
    
  });

  const fetchConversations = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await ChatRepository.getConversations();
      setState(prev => ({
        ...prev,
        conversations: res.data,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to fetch conversations"
      }));
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await ChatRepository.getUsers();
      const profiles: Profile[] = res.data;
      
      // Store the profiles in state
      setState(prev => ({
        ...prev,
        profile: profiles,
        error: null
      }));

      // Map profiles to users
      const users: User[] = profiles.map(profile => ({
        id: profile.user.id,
        username: profile.username,
        firstname: profile.user.firstname,
        lastname: profile.user.lastname,
        email: profile.user.email,
        profile: [profile]
      }));

      setState(prev => ({
        ...prev,
        users,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to fetch users"
      }));
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await ChatRepository.getMessages(conversation.id);
      setState(prev => ({
        ...prev,
        selectedConversation: conversation,
        messages: res.data.results || res.data,
        loading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to fetch messages"
      }));
    }
  };

  const sendMessage = async ({ conversationId, text, image, gif_url }: SendMessagePayload) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const formData = new FormData();
      formData.append("conversation", conversationId.toString());
      if (text) formData.append("text", text);
      if (image) formData.append("image", image);
      if (gif_url) formData.append("gif_url", gif_url);
      
      await ChatRepository.sendMessage(formData);
      if (state.selectedConversation) {
        await selectConversation(state.selectedConversation);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to send message"
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const createConversation = async ({ participants, name, is_group = false }: CreateConversationPayload) => {
  setState(prev => ({ ...prev, loading: true }));
  try {
    const res = await ChatRepository.createConversation({ 
      participants, 
      name,
      is_group 
    });
    await fetchConversations();
    return res.data;
  } catch (error) {
    setState(prev => ({
      ...prev,
      error: "Failed to create conversation"
    }));
    throw error;
  } finally {
    setState(prev => ({ ...prev, loading: false }));
  }
};

  const deleteConversation = async (id: number) => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      await ChatRepository.deleteConversation(id);
      await fetchConversations();
      setState(prev => ({
        ...prev,
        selectedConversation: null,
        messages: []
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to delete conversation"
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const reactToMessage = async (messageId: number, emoji: string) => {
    try {
      await ChatRepository.reactToMessage({ message: messageId, emoji });
      if (state.selectedConversation) {
        await selectConversation(state.selectedConversation);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: "Failed to react to message"
      }));
    }
  };

  return (
    <ChatContext.Provider
      value={{
        ...state,
        fetchConversations,
        fetchUsers,
        selectConversation,
        sendMessage,
        createConversation,
        deleteConversation,
        reactToMessage,
        
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
import { createContext, useContext, useState, ReactNode } from "react";
import ChatRepository from "../../../infrastructure/repositories/ChatRepository";
import { 
  ChatState, 
  Conversation,
  Message,
  User, 
  SendMessagePayload, 
  CreateConversationPayload, 
  Profile
} from "../../domain/entities/Chat.entity";
import { censorText } from "../../../utils/censorText";
import { useAuth } from "./AuthContext";

interface ChatContextType extends ChatState {
  isChatOpen: boolean;
  fetchConversations: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  selectConversation: (conversation: Conversation) => Promise<void>;
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  createConversation: (payload: CreateConversationPayload) => Promise<Conversation>;
  deleteConversation: (id: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  unsendMessage: (messageId: string) => Promise<void>;
  hideMessage: (messageId: string) => Promise<void>;
  acceptMessageRequest: (conversationId: string) => Promise<void>;
  rejectMessageRequest: (conversationId: string) => Promise<void>;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  backToChatList: () => void;
  openChatWithUser: (userId: string) => Promise<void>;
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
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
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
    setState((prev) => ({
      ...prev,
      selectedConversation: conversation,
      messages: conversation.messages || [],
      loading: true,
      error: null,
    }));
    try {
      const res = await ChatRepository.getMessages(conversation.id);
      const list = Array.isArray(res.data) ? res.data : res.data?.results || [];
      setState((prev) => (
        String(prev.selectedConversation?.id) === String(conversation.id)
          ? { ...prev, messages: list, loading: false, error: null }
          : prev
      ));
    } catch {
      setState((prev) => (
        String(prev.selectedConversation?.id) === String(conversation.id)
          ? { ...prev, loading: false, error: "Failed to fetch messages" }
          : prev
      ));
    }
  };

  const sendMessage = async ({ conversationId, text, image, gif_url }: SendMessagePayload) => {
    try {
      const formData = new FormData();
      formData.append("conversation", conversationId.toString());
      if (text) formData.append("text", censorText(text));
      if (image) formData.append("image", image);
      if (gif_url) formData.append("gif_url", gif_url);

      const res = await ChatRepository.sendMessage(formData);
      const created = res.data;
      setState((prev) => ({
        ...prev,
        messages:
          String(prev.selectedConversation?.id) === String(conversationId) && created
            ? [...prev.messages.filter((msg) => String(msg.id) !== String(created.id)), created]
            : prev.messages,
        conversations: prev.conversations.map((conversation) =>
          String(conversation.id) === String(conversationId)
            ? {
                ...conversation,
                messages: [...(conversation.messages || []).filter((msg) => String(msg.id) !== String(created?.id)), created].filter(Boolean),
              }
            : conversation
        ),
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Failed to send message",
      }));
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

  const deleteConversation = async (id: string) => {
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

  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);
  const toggleChat = () => setIsChatOpen((value) => !value);
  const backToChatList = () => {
    setState((prev) => ({ ...prev, selectedConversation: null, messages: [] }));
  };

  const findDirectConversation = (list: Conversation[], userId: string, currentUserId: string) =>
    list.find((conversation) =>
      !conversation.is_group &&
      conversation.participants.some((participant) => String(participant.id) === String(userId)) &&
      conversation.participants.some((participant) => String(participant.id) === String(currentUserId))
    );

  const openChatWithUser = async (userId: string) => {
    setIsChatOpen(true);
    if (!user) return;
    const local = findDirectConversation(state.conversations, userId, user.id);
    if (local) {
      await selectConversation(local);
      return;
    }
    try {
      const res = await ChatRepository.getConversations();
      const conversations = res.data || [];
      setState((prev) => ({ ...prev, conversations }));
      const existing = findDirectConversation(conversations, userId, user.id);
      if (existing) {
        await selectConversation(existing);
        return;
      }
      const created = await createConversation({
        participants: [user.id, userId],
      });
      await selectConversation(created);
    } catch {
      setState((prev) => ({ ...prev, error: "Failed to open chat" }));
    }
  };

  const applyMessageUpdate = (messageId: string, next?: Message | null) => {
    setState((prev) => ({
      ...prev,
      messages: next
        ? prev.messages.map((msg) => (String(msg.id) === String(messageId) ? next : msg))
        : prev.messages.filter((msg) => String(msg.id) !== String(messageId)),
      conversations: prev.conversations.map((conversation) => ({
        ...conversation,
        messages: next
          ? (conversation.messages || []).map((msg) => (String(msg.id) === String(messageId) ? next : msg))
          : (conversation.messages || []).filter((msg) => String(msg.id) !== String(messageId)),
      })),
    }));
  };

  const unsendMessage = async (messageId: string) => {
    try {
      const res = await ChatRepository.updateMessage(messageId, "unsend");
      applyMessageUpdate(messageId, res.data);
    } catch {
      setState((prev) => ({ ...prev, error: "Failed to unsend message" }));
    }
  };

  const hideMessage = async (messageId: string) => {
    try {
      await ChatRepository.updateMessage(messageId, "hide");
      applyMessageUpdate(messageId);
    } catch {
      setState((prev) => ({ ...prev, error: "Failed to delete message" }));
    }
  };

  const acceptMessageRequest = async (conversationId: string) => {
    try {
      const res = await ChatRepository.updateConversation(conversationId, "accept");
      const updated = res.data;
      setState((prev) => ({
        ...prev,
        selectedConversation: updated,
        conversations: prev.conversations.map((conversation) =>
          String(conversation.id) === String(conversationId) ? { ...conversation, ...updated } : conversation
        ),
        error: null,
      }));
    } catch {
      setState((prev) => ({ ...prev, error: "Failed to accept message request" }));
    }
  };

  const rejectMessageRequest = async (conversationId: string) => {
    try {
      await ChatRepository.updateConversation(conversationId, "reject");
      setState((prev) => ({
        ...prev,
        selectedConversation: null,
        messages: [],
        conversations: prev.conversations.filter((conversation) => String(conversation.id) !== String(conversationId)),
        error: null,
      }));
    } catch {
      setState((prev) => ({ ...prev, error: "Failed to reject message request" }));
    }
  };

  const reactToMessage = async (messageId: string, emoji: string) => {
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
        unsendMessage,
        hideMessage,
        acceptMessageRequest,
        rejectMessageRequest,
        isChatOpen,
        openChat,
        closeChat,
        toggleChat,
        backToChatList,
        openChatWithUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
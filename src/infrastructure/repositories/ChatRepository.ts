import { axiosInstance } from '../../utils/axiosinstance';

const ChatRepository = {
  getUsers: () => axiosInstance.get('/api/user/others'),
  getConversations: () => axiosInstance.get('/api/conversation'),
  getConversation: (id: string | number) => axiosInstance.get(`/api/conversation/${id}`),
  createConversation: (data: any) => axiosInstance.post('/api/conversation', {
    participants: data.participants,
    name: data.name,
    is_group: data.is_group,
  }),
  deleteConversation: (id: string | number) => axiosInstance.delete(`/api/conversation/${id}`),
  updateConversation: (id: string | number, action: "accept" | "reject") =>
    axiosInstance.patch(`/api/conversation/${id}`, { action }),
  getMessages: (conversationId: string | number) => axiosInstance.get(`/api/message?conversation=${conversationId}`),
  sendMessage: (data: FormData) => axiosInstance.post('/api/message', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateMessage: (id: string | number, action: 'unsend' | 'hide') =>
    axiosInstance.patch(`/api/message/${id}`, { action }),
  reactToMessage: (data: any) => axiosInstance.post('/api/reaction', {
    message: data.message,
    emoji: data.emoji,
  }),
  getReactions: (messageId: string | number) => axiosInstance.get(`/api/reaction?message=${messageId}`),
};

export default ChatRepository;

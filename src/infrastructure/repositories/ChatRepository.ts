import { axiosInstance } from '../../utils/axiosinstance';

const ChatRepository = {
  getUsers: () => axiosInstance.get('/profile/other-users-profiles/'),
  getConversations: () => axiosInstance.get('/api/chat/conversations/'),
  getConversation: (id: string | number) => axiosInstance.get(`/api/chat/conversations/${id}/`),
  createConversation: (data: any) => axiosInstance.post('/api/chat/conversations/', data),
  deleteConversation: (id: string | number) => axiosInstance.delete(`/api/chat/conversations/${id}/delete_conversation/`),
  getMessages: (conversationId: string | number) => axiosInstance.get(`/api/chat/messages/?conversation=${conversationId}`),
  sendMessage: (data: FormData) => axiosInstance.post('/api/chat/messages/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  reactToMessage: (data: any) => axiosInstance.post('/api/chat/reactions/', data),
  getReactions: (messageId: string | number) => axiosInstance.get(`/api/chat/reactions/?message=${messageId}`),
};

export default ChatRepository; 
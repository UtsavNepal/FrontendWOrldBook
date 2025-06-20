import React, { useEffect, useState, useRef } from "react";
import { useChatContext } from "../../core/application/context/ChatContext";
import { useAuth } from "../../core/application/context/AuthContext";
import { Profile, User } from "../../core/domain/entities/Chat.entity";
import MainLayout from "../components/MainLayout";

const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getImageUrl = (path?: string | null): string => {
  if (!path) return 'default-avatar.png';
  if (path.startsWith('http')) return path;
  return `${BACKEND_BASE_URL}${path}`;
};

const getUserProfilePicture = (userId: number, profiles: Profile[]): string => {
 
  const { user } = useAuth();
  if (user && userId === user.id) {
    return user.profile_picture ? getImageUrl(user.profile_picture) : '/default-avatar.png';
  }

  const matchedProfile = profiles.find(p => p.user?.id === userId);
  const profilePic = matchedProfile?.profile_picture;

  return profilePic ? getImageUrl(profilePic) : '/default-avatar.png';
};

const getFullName = (user: User): string => {
  return [user.firstname, user.lastname].filter(Boolean).join(" ") || 
         user.username || 
         user.email || 
         "Unknown";
};

const emojiOptions = ['👍', '😂', '❤️', '😮', '😢', '👏'];

const ChatPage: React.FC = () => {
  const {
    users,
    conversations,
    selectedConversation,
    messages,
    loading,
    selectConversation,
    sendMessage,
    createConversation,
    deleteConversation,
    reactToMessage,
    profile,
    fetchConversations,
    fetchUsers,
    error,
  } = useChatContext();
  
  const { user, isAuthLoading } = useAuth();
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState("");
  const [openReactionDropdown, setOpenReactionDropdown] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedConversation]);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUsers();
    }
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message && !image && !gifUrl) return;
    
    if (!selectedConversation) return;
    
    await sendMessage({
      conversationId: selectedConversation.id,
      text: message,
      image,
      gif_url: gifUrl
    });
    
    setMessage("");
    setImage(null);
    setImagePreview(null);
    setGifUrl("");
  };

  const handleStartChat = async (userId: number) => {
    if (!user) return;
    
    // Check for existing 1:1 conversation
    const existingConv = conversations.find(c => 
      !c.is_group && 
      c.participants.some(p => p.id === userId) &&
      c.participants.some(p => p.id === user.id)
    );
    
    if (existingConv) {
      await selectConversation(existingConv);
    } else {
      const newConv = await createConversation({
        participants: [user.id, userId]
      });
      await selectConversation(newConv);
    }
  };

  const chatPartner = selectedConversation && !selectedConversation.is_group
    ? selectedConversation.participants.find(p => p.id !== user?.id)
    : null;

  const handleDeleteConversation = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      await deleteConversation(id);
    }
  };

  const getProfileIdByUserId = (userId: number) => {
    const matchedProfile = Array.isArray(profile)
      ? profile.find((p: any) => p.user?.id === userId)
      : null;
    return matchedProfile?.id;
  };

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Please login to access chat</div>;
  }

  return (
    <MainLayout>
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 text-center font-semibold">
          {error}
        </div>
      )}
      <div className="flex flex-col md:flex-row bg-gray-50 overflow-hidden h-screen w-full">
        {/* Sidebar */}
        <aside className="w-full md:w-72 bg-white border-r h-64 md:h-screen flex flex-col">
          <div className="p-4 bg-white z-10 sticky top-0">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Chats</h2>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 pb-4">
            <h3 className="font-semibold mb-2 text-base sm:text-lg">Users</h3>
            <ul>
              {users.filter(u => u.id !== user.id).map(u => (
                <li key={u.id}>
                  <button
                    className={`w-full text-left py-1 px-2 rounded flex items-center gap-2 text-sm sm:text-base ${
                      selectedConversation?.participants.some(p => p.id === u.id)
                        ? "bg-blue-100"
                        : "hover:bg-blue-50"
                    }`}
                    onClick={() => handleStartChat(u.id)}
                  >
                    <div className="relative">
                      <img
                        src={getUserProfilePicture(u.id, profile)}
                        alt={getFullName(u)}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                    </div>
                    <span>{getFullName(u)}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="pt-4">
              <h3 className="font-semibold mb-2 text-base sm:text-lg">Conversations</h3>
            </div>
            <ul>
              {conversations.map(conv => {
                const partner = !conv.is_group
                  ? conv.participants.find(p => p.id !== user.id)
                  : null;
                return (
                  <li key={conv.id}>
                    <button
                      className={`w-full text-left py-1 px-2 rounded flex items-center gap-2 text-sm sm:text-base ${
                        selectedConversation?.id === conv.id
                          ? "bg-blue-100"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => selectConversation(conv)}
                    >
                      {partner && (
                        <img
                          src={getUserProfilePicture(partner.id, profile)}
                          alt={getFullName(partner)}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                        />
                      )}
                      <span>
                        {conv.is_group
                          ? conv.name
                          : partner
                          ? getFullName(partner)
                          : "Unknown"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {selectedConversation && (
              <div className="flex-shrink-0 p-4">
                <button
                  className="w-full bg-red-100 text-red-600 py-2 rounded hover:bg-red-200 text-sm sm:text-base"
                  onClick={() => handleDeleteConversation(selectedConversation.id)}
                >
                  Delete Conversation
                </button>
              </div>
            )}
          </div>
        </aside>
        {/* Main chat area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-16rem)] md:h-screen">
          {/* Chat header */}
          {selectedConversation && (
            <div className="flex items-center gap-4 border-b p-2 sm:p-4 bg-white shadow-sm flex-shrink-0 relative">
              {chatPartner && (
                <img
                  src={getUserProfilePicture(chatPartner.id, profile)}
                  alt={getFullName(chatPartner)}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                />
              )}
              <span
                className="text-base sm:text-lg font-bold cursor-pointer relative"
                onClick={() => setHeaderDropdownOpen(v => !v)}
              >
                {selectedConversation.is_group
                  ? selectedConversation.name
                  : chatPartner
                  ? getFullName(chatPartner)
                  : ""}
                {headerDropdownOpen && chatPartner && (
                  <div className="absolute left-0 top-full mt-2 bg-white border rounded shadow z-20 min-w-[160px]">
                    <button
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        const profileId = getProfileIdByUserId(chatPartner.id);
                        if (profileId) {
                          window.location.href = `/profile/${profileId}`;
                        } else {
                          alert('Profile not found');
                        }
                        setHeaderDropdownOpen(false);
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                )}
              </span>
            </div>
          )}
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 bg-gray-50">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div>Loading messages...</div>
              </div>
            ) : selectedConversation ? (
              <>
                {messages.length === 0 ? (
                  <div className="text-gray-400 text-center my-8 text-sm sm:text-base">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map(msg => {
                    const isSent = msg.sender.id === user.id;
                    return (
                      <div key={msg.id} className={`mb-2 flex ${isSent ? "justify-end" : "justify-start"}`}>
                        <div className={`flex items-end gap-2 ${isSent ? "flex-row-reverse" : ""}`}>
                          <img
                            src={getUserProfilePicture(msg.sender.id, profile)}
                            alt={getFullName(msg.sender)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                          />
                          <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-2xl shadow text-sm sm:text-base ${isSent ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 text-gray-900 rounded-bl-none"}`}>
                            <div className="text-xs text-gray-300 mb-1 font-semibold">{getFullName(msg.sender)}</div>
                            {msg.text && <div className="whitespace-pre-wrap break-words">{msg.text}</div>}
                            {msg.image && (
                              <img src={msg.image} alt="attachment" className="max-h-40 rounded mt-2" />
                            )}
                            {msg.gif_url && (
                              <img src={msg.gif_url} alt="gif" className="max-h-40 rounded mt-2" />
                            )}
                            <div className="flex items-center mt-1 space-x-1 relative">
                              {msg.reactions.map(r => (
                                <span key={r.id} className="text-lg cursor-pointer">{r.emoji}</span>
                              ))}
                              <button
                                className="ml-2 text-xs text-gray-400 hover:text-gray-600"
                                type="button"
                                onClick={() => setOpenReactionDropdown(
                                  openReactionDropdown === msg.id ? null : msg.id
                                )}
                              >
                                ⋯
                              </button>
                              {openReactionDropdown === msg.id && (
                                <div className="absolute z-10 bottom-full left-0 bg-white border rounded shadow p-2 flex gap-2">
                                  {emojiOptions.map(emoji => (
                                    <button
                                      key={emoji}
                                      className="text-lg"
                                      type="button"
                                      onClick={() => {
                                        reactToMessage(msg.id, emoji);
                                        setOpenReactionDropdown(null);
                                      }}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className={`text-[10px] mt-1 ${isSent ? "text-blue-200" : "text-gray-500"}`}>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="text-gray-400 text-center mt-20 text-sm sm:text-base">
                Select a conversation or user to start chatting.
              </div>
            )}
          </div>
          {/* Message input area */}
          {selectedConversation && (
            <>
              {imagePreview && (
                <div className="flex items-center gap-2 p-2 sm:p-4 bg-white border-t border-b">
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded shadow"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                  <span className="text-gray-500 text-sm">Image selected</span>
                </div>
              )}
              <form onSubmit={handleSend} className="flex items-center gap-2 p-2 sm:p-4 bg-white border-t flex-shrink-0">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 sm:p-3 rounded border text-sm sm:text-base"
                />
                <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="chat-image-upload" />
                <label htmlFor="chat-image-upload" className="cursor-pointer text-blue-500 text-sm sm:text-base">📎</label>
                <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded text-sm sm:text-base">Send</button>
              </form>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatPage;
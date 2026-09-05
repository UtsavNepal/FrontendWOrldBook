import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Minus, X } from "lucide-react";
import { useChatContext } from "../../core/application/context/ChatContext";
import { useAuth } from "../../core/application/context/AuthContext";
import { Conversation, Profile, User } from "../../core/domain/entities/Chat.entity";
import { getImageUrl } from "../../utils/getImageUrl";
import { useConfirm } from "./useConfirm";
import { censorText } from "../../utils/censorText";
import OptionsMenu from "./OptionsMenu";

const MUTED_KEY = "wb_muted_chats";
const BLOCKED_KEY = "wb_blocked_users";

function readIds(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as string[] : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids));
}

const getUserProfilePicture = (userId: string, profiles: Profile[], currentUser?: any): string => {
  if (currentUser && String(userId) === String(currentUser.id)) {
    return getImageUrl(currentUser.profile_picture);
  }
  const matchedProfile = profiles.find((p) => String(p.user?.id) === String(userId));
  return getImageUrl(matchedProfile?.profile_picture);
};

const getFullName = (user: User): string => {
  return [user.firstname, user.lastname].filter(Boolean).join(" ") ||
    user.username ||
    user.email ||
    "Unknown";
};

function isIncomingRequest(conversation: Conversation | null, userId?: string) {
  if (!conversation || conversation.is_group) return false;
  if (conversation.is_message_request) return true;
  return conversation.request_status === "pending"
    && Boolean(conversation.requested_by)
    && String(conversation.requested_by) !== String(userId);
}

function isOutgoingRequest(conversation: Conversation | null, userId?: string) {
  return Boolean(
    conversation
    && !conversation.is_group
    && conversation.request_status === "pending"
    && String(conversation.requested_by) === String(userId)
  );
}

const ChatDock: React.FC = () => {
  const {
    users,
    conversations,
    selectedConversation,
    messages,
    loading,
    selectConversation,
    sendMessage,
    deleteConversation,
    unsendMessage,
    hideMessage,
    acceptMessageRequest,
    rejectMessageRequest,
    profile,
    fetchConversations,
    fetchUsers,
    isChatOpen,
    closeChat,
    backToChatList,
    openChatWithUser,
  } = useChatContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { confirm, modal } = useConfirm();
  const [minimized, setMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [peopleLoaded, setPeopleLoaded] = useState(false);
  const [sharedOpen, setSharedOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [mutedIds, setMutedIds] = useState<string[]>(() => readIds(MUTED_KEY));
  const [blockedIds, setBlockedIds] = useState<string[]>(() => readIds(BLOCKED_KEY));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const otherUsers = users.filter((u) => String(u.id) !== String(user?.id) && !blockedIds.includes(String(u.id)));

  useEffect(() => {
    if (isChatOpen && user) {
      setMinimized(false);
      Promise.all([fetchConversations(), fetchUsers()]).finally(() => setPeopleLoaded(true));
    }
  }, [isChatOpen, user]);

  useEffect(() => {
    if (selectedConversation && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedConversation]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (!isChatOpen || !user) return null;

  const chatPartner = selectedConversation && !selectedConversation.is_group
    ? selectedConversation.participants.find((p) => String(p.id) !== String(user.id))
    : null;
  const isBlocked = Boolean(chatPartner && blockedIds.includes(String(chatPartner.id)));
  const incomingRequest = isIncomingRequest(selectedConversation, user.id);
  const outgoingRequest = isOutgoingRequest(selectedConversation, user.id);
  const title = selectedConversation
    ? (selectedConversation.is_group ? selectedConversation.name : chatPartner ? getFullName(chatPartner) : "Chat")
    : "Chats";

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) {
      setNotice("Unblock this person to send a message.");
      return;
    }
    if (incomingRequest) {
      setNotice("Accept this message request to reply.");
      return;
    }
    if (!selectedConversation || (!message.trim() && !image)) return;
    await sendMessage({
      conversationId: selectedConversation.id,
      text: message,
      image,
    });
    setMessage("");
    setImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleUnsendMessage = async (messageId: string) => {
    const ok = await confirm({
      title: "Unsend for everyone",
      message: "This message will be removed for everyone in the conversation.",
      confirmLabel: "Unsend",
    });
    if (ok) await unsendMessage(messageId);
  };

  const handleHideMessage = async (messageId: string) => {
    const ok = await confirm({
      title: "Delete for me",
      message: "This message will be removed from your chat only. Others can still see it.",
      confirmLabel: "Delete",
    });
    if (ok) await hideMessage(messageId);
  };

  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    const ok = await confirm({
      title: "Delete conversation",
      message: "Are you sure you want to delete this conversation?",
    });
    if (ok) await deleteConversation(selectedConversation.id);
  };

  const handleViewProfile = () => {
    if (!chatPartner) return;
    navigate(`/profile/${chatPartner.id}`);
  };

  const handleMuteConversation = () => {
    if (!selectedConversation) return;
    const id = String(selectedConversation.id);
    const next = mutedIds.includes(id)
      ? mutedIds.filter((item) => item !== id)
      : [...mutedIds, id];
    setMutedIds(next);
    writeIds(MUTED_KEY, next);
    setNotice(next.includes(id) ? "Conversation muted." : "Conversation unmuted.");
  };

  const handleBlock = async () => {
    if (!chatPartner) return;
    const ok = await confirm({
      title: "Block this person",
      message: "You can still see this conversation, but you cannot send messages until you unblock them.",
      confirmLabel: "Block",
    });
    if (!ok) return;
    const next = [...new Set([...blockedIds, String(chatPartner.id)])];
    setBlockedIds(next);
    writeIds(BLOCKED_KEY, next);
    setNotice("This person has been blocked. Unblock to send messages.");
  };

  const handleUnblock = () => {
    if (!chatPartner) return;
    const next = blockedIds.filter((id) => id !== String(chatPartner.id));
    setBlockedIds(next);
    writeIds(BLOCKED_KEY, next);
    setNotice("This person has been unblocked.");
  };

  const handleReport = async () => {
    const ok = await confirm({
      title: "Report conversation",
      message: "Report this conversation for review?",
      confirmLabel: "Report",
    });
    if (ok) setNotice("Thanks. Your report was submitted.");
  };

  const handleAcceptRequest = async () => {
    if (!selectedConversation) return;
    await acceptMessageRequest(selectedConversation.id);
    setNotice("Message request accepted.");
  };

  const handleRejectRequest = async () => {
    if (!selectedConversation) return;
    const ok = await confirm({
      title: "Reject message request",
      message: "This request will be removed from your inbox. They will not be notified.",
      confirmLabel: "Reject",
    });
    if (ok) await rejectMessageRequest(selectedConversation.id);
  };

  const talkedConversations = conversations.filter((conv) => {
    const partner = conv.is_group
      ? true
      : conv.participants.find((p) => String(p.id) !== String(user.id));
    const hasTalked = !Array.isArray(conv.messages) || conv.messages.length > 0;
    return Boolean(partner) && hasTalked;
  });
  const requestConversations = talkedConversations.filter((conv) => isIncomingRequest(conv, user.id));
  const inboxConversations = talkedConversations.filter((conv) => !isIncomingRequest(conv, user.id));

  const conversationPreview = (conv: Conversation) => {
    const partner = !conv.is_group
      ? conv.participants.find((p) => String(p.id) !== String(user.id))
      : null;
    const lastMessage = conv.messages?.length ? conv.messages[conv.messages.length - 1] : null;
    return { partner, lastMessage };
  };

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="fixed bottom-0 right-3 z-[70] hidden h-12 w-[280px] items-center gap-2 rounded-t-xl bg-gradient-to-r from-[#1877F2] to-indigo-500 px-3 text-left text-white shadow-card md:flex"
      >
        {chatPartner && (
          <img
            src={getUserProfilePicture(chatPartner.id, profile, user)}
            alt=""
            className="h-8 w-8 rounded-full object-cover"
          />
        )}
        <span className="flex-1 truncate text-sm font-semibold">{title}</span>
      </button>
    );
  }

  return (
    <>
      {modal}
      <div className="wb-chat-shell fixed inset-0 z-[80] flex flex-col overflow-hidden border-indigo-100 md:inset-auto md:bottom-0 md:right-4 md:z-[70] md:h-[min(560px,calc(100vh-4.5rem))] md:w-[360px] md:rounded-t-xl md:border md:border-b-0 md:shadow-card">
        <div className="flex items-center gap-2 bg-gradient-to-r from-[#1877F2] to-indigo-500 px-3 py-3 text-white md:py-2.5">
          {selectedConversation && (
            <button
              type="button"
              className="rounded-full p-1 hover:bg-white/15"
              onClick={backToChatList}
              aria-label="Back to chats"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {chatPartner && (
            <img
              src={getUserProfilePicture(chatPartner.id, profile, user)}
              alt=""
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white/40"
            />
          )}
          <h2 className="min-w-0 flex-1 truncate text-base font-bold">
            {title}
            {selectedConversation && mutedIds.includes(String(selectedConversation.id)) && (
              <span className="ml-2 text-xs font-medium text-white/80">Muted</span>
            )}
            {isBlocked && <span className="ml-2 text-xs font-medium text-white/80">Blocked</span>}
            {incomingRequest && <span className="ml-2 text-xs font-medium text-white/80">Request</span>}
          </h2>
          {selectedConversation && (
            <OptionsMenu
              variant="light"
              extra={[
                ...(chatPartner ? [{ label: "View profile", onClick: handleViewProfile }] : []),
                { label: "View shared image", onClick: () => setSharedOpen(true) },
                { label: "Delete conversation", onClick: handleDeleteConversation, danger: true },
                {
                  label: mutedIds.includes(String(selectedConversation.id)) ? "Unmute conversation" : "Mute conversation",
                  onClick: handleMuteConversation,
                },
                ...(chatPartner
                  ? [{
                      label: isBlocked ? "Unblock" : "Block",
                      onClick: isBlocked ? handleUnblock : handleBlock,
                      danger: !isBlocked,
                    }] 
                  : []),
                { label: "Report", onClick: handleReport, danger: true },
              ]}
            />
          )}
          <button
            type="button"
            className="hidden rounded-full p-1 hover:bg-white/15 md:inline-flex"
            onClick={() => setMinimized(true)}
            aria-label="Minimize chat"
          >
            <Minus size={18} />
          </button>
          <button
            type="button"
            className="rounded-full p-1 hover:bg-white/15"
            onClick={closeChat}
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        {!selectedConversation ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            {!peopleLoaded ? (
              <p className="px-3 py-8 text-center text-sm text-wb-muted">Loading...</p>
            ) : otherUsers.length === 0 && talkedConversations.length === 0 ? (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <p className="text-sm text-wb-muted">
                  Currently only you have created an account.
                </p>
              </div>
            ) : (
              <>
                {otherUsers.length > 0 && (
                  <div className="border-b border-indigo-100 bg-white/40 px-3 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-wb-muted">People</p>
                    <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {otherUsers.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          className="w-16 shrink-0 snap-start flex flex-col items-center"
                          onClick={() => openChatWithUser(String(u.id))}
                        >
                          <img
                            src={getUserProfilePicture(u.id, profile, user)}
                            alt=""
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-card"
                          />
                          <span className="mt-1 w-full truncate text-center text-[11px] font-medium">
                            {u.firstname || u.username || getFullName(u)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="px-3 py-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-wb-muted">Conversations</p>
                  {inboxConversations.length === 0 ? (
                    <p className="py-6 text-center text-sm text-wb-muted">
                      No conversations yet. Open a profile above to start chatting.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {inboxConversations.map((conv) => {
                        const { partner, lastMessage } = conversationPreview(conv);
                        return (
                          <button
                            key={conv.id}
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-white/70"
                            onClick={() => selectConversation(conv)}
                          >
                            <img
                              src={getUserProfilePicture(partner?.id || "", profile, user)}
                              alt=""
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold">
                                {conv.is_group ? conv.name : partner ? getFullName(partner) : "Unknown"}
                              </p>
                              <p className="truncate text-sm text-wb-muted">
                                {partner && blockedIds.includes(String(partner.id))
                                  ? "Blocked"
                                  : conv.request_status === "pending" && String(conv.requested_by) === String(user.id)
                                    ? "Message request sent"
                                    : lastMessage?.deleted
                                    ? "Message unsent"
                                    : lastMessage?.text
                                    ? censorText(lastMessage.text)
                                    : lastMessage?.image
                                      ? "Photo"
                                      : "Tap to open chat"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {requestConversations.length > 0 && (
                  <div className="border-t border-indigo-100 px-3 py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-wb-muted">
                      Message requests · {requestConversations.length}
                    </p>
                    <div className="space-y-1">
                      {requestConversations.map((conv) => {
                        const { partner, lastMessage } = conversationPreview(conv);
                        return (
                          <button
                            key={conv.id}
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-white/70"
                            onClick={() => selectConversation(conv)}
                          >
                            <img
                              src={getUserProfilePicture(partner?.id || "", profile, user)}
                              alt=""
                              className="h-12 w-12 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold">
                                {partner ? getFullName(partner) : "Unknown"}
                              </p>
                              <p className="truncate text-sm text-wb-muted">
                                {lastMessage?.text
                                  ? censorText(lastMessage.text)
                                  : lastMessage?.image
                                    ? "Photo"
                                    : "Message request"}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <>
            <div className="wb-chat-thread min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {loading && messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-wb-muted">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-wb-muted">No messages yet. Say hello.</p>
              ) : (
                messages.map((msg) => {
                  const isSent = String(msg.sender?.id) === String(user.id);
                  return (
                    <div key={msg.id} className={`group mb-2 flex items-end gap-1 ${isSent ? "justify-end" : "justify-start"}`}>
                      {isSent && (
                        <OptionsMenu
                          size="sm"
                          align="right"
                          className="relative shrink-0"
                          extra={[
                            ...(!msg.deleted ? [{ label: "Unsend for everyone", onClick: () => handleUnsendMessage(msg.id), danger: true }] : []),
                            { label: "Delete for me", onClick: () => handleHideMessage(msg.id), danger: true },
                          ]}
                        />
                      )}
                      <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-card ${
                        msg.deleted
                          ? "bg-white/80 italic text-wb-muted"
                          : isSent ? "rounded-br-none bg-wb-blue text-white" : "rounded-bl-none bg-white/90 text-wb-ink"
                      }`}>
                        {msg.deleted ? (
                          <p>This message was unsent</p>
                        ) : (
                          <>
                        {msg.text && <p className="whitespace-pre-wrap break-words">{censorText(msg.text)}</p>}
                        {msg.image && (
                          <img
                            src={getImageUrl(msg.image)}
                            alt=""
                            className={`max-h-48 w-full rounded-lg object-cover ${msg.text ? "mt-2" : ""}`}
                          />
                        )}
                          </>
                        )}
                        <p className={`mt-1 text-[10px] ${!msg.deleted && isSent ? "text-blue-100" : "text-wb-muted"}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {!isSent && (
                        <OptionsMenu
                          size="sm"
                          align="left"
                          className="relative shrink-0"
                          extra={[
                            { label: "Delete for me", onClick: () => handleHideMessage(msg.id), danger: true },
                          ]}
                        />
                      )}
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {isBlocked ? (
              <div className="border-t border-indigo-100 bg-white/90 px-4 py-3 text-center">
                <p className="mb-2 text-sm text-wb-muted">You blocked this person. Unblock to send messages.</p>
                <button type="button" className="wb-btn-primary" onClick={handleUnblock}>
                  Unblock
                </button>
              </div>
            ) : incomingRequest ? (
              <div className="border-t border-indigo-100 bg-white/90 px-4 py-3 text-center">
                <p className="mb-3 text-sm text-wb-muted">
                  {chatPartner ? getFullName(chatPartner) : "This person"} is not your friend. Accept to reply, or reject to remove this request.
                </p>
                <div className="flex gap-2">
                  <button type="button" className="wb-btn-secondary flex-1" onClick={handleRejectRequest}>
                    Reject
                  </button>
                  <button type="button" className="wb-btn-primary flex-1" onClick={handleAcceptRequest}>
                    Accept
                  </button>
                </div>
              </div>
            ) : (
              <>
            {outgoingRequest && (
              <p className="border-t border-indigo-100 bg-white/80 px-4 py-2 text-center text-xs text-wb-muted">
                Message request sent. They can reply after they accept.
              </p>
            )}
            {imagePreview && (
              <div className="flex items-center gap-2 border-t border-indigo-100 bg-white/80 px-3 py-2">
                <div className="relative">
                  <img src={imagePreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                    onClick={() => { setImage(null); setImagePreview(null); }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-indigo-100 bg-white/80 p-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Aa"
                className="wb-input"
              />
              <input
                id="chat-dock-image"
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setImage(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
              />
              <label htmlFor="chat-dock-image" className="cursor-pointer text-xs font-semibold text-wb-blue">
                Photo
              </label>
              <button type="submit" className="wb-btn-primary px-3">Send</button>
            </form>
              </>
            )}
          </>
        )}
      </div>
      {sharedOpen && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4" onClick={() => setSharedOpen(false)}>
          <div className="wb-card max-h-[80vh] w-full max-w-md overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-bold">Shared images</h3>
              <button type="button" className="rounded-full p-1 hover:bg-wb-canvas" onClick={() => setSharedOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {messages.filter((msg) => msg.image).length === 0 ? (
              <p className="py-8 text-center text-sm text-wb-muted">No shared images in this conversation.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {messages.filter((msg) => msg.image).map((msg) => (
                  <img key={msg.id} src={getImageUrl(msg.image)} alt="" className="h-36 w-full rounded-lg object-cover" />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {notice && (
        <div className="fixed bottom-6 left-1/2 z-[96] -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm text-white">
          {notice}
          <button type="button" className="ml-3 font-semibold" onClick={() => setNotice(null)}>OK</button>
        </div>
      )}
    </>
  );
};

export default ChatDock;

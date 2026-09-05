import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useChatContext } from "../../core/application/context/ChatContext";

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { openChat, openChatWithUser } = useChatContext();

  useEffect(() => {
    const userId = params.get("user");
    if (userId) {
      openChatWithUser(userId);
    } else {
      openChat();
    }
    navigate("/feed", { replace: true });
  }, []);

  return null;
};

export default ChatPage;

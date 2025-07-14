import type { ChatMessage } from "../services/websocket/WebSocketService";
import type { Message } from "../types/chat.types";

export const convertChatMessageToMessage = (
  chatMessage: ChatMessage,
): Message => {
  return {
    id: chatMessage.id,
    sender: chatMessage.role === "user" ? "user" : "ai",
    text: chatMessage.content,
    timestamp: chatMessage.timestamp.toISOString(),
    status: "sent",
    isOffline: false,
    isTyping: false,
    isFinal: true,
    seenChunks: [],
  };
};

export const convertChatMessagesToMessages = (
  chatMessages: ChatMessage[],
): Message[] => {
  return chatMessages.map(convertChatMessageToMessage);
};

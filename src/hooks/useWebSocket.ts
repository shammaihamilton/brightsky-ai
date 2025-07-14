import { useEffect, useState, useCallback } from "react";
import {
  WebSocketService,
  type ChatMessage,
  // type WebSocketMessage,
  // type StatusData,
  // type ErrorData,
} from "../services/websocket/WebSocketService";

export interface UseWebSocketReturn {
  isConnected: boolean;
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (message: string) => void;
  clearMessages: () => void;
  connectionError: string | null;
}

import { useMemo } from "react";

export const useWebSocket = (baseUrl?: string): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsService = useMemo(
    () => WebSocketService.getInstance(baseUrl),
    [baseUrl],
  );

  useEffect(() => {
    const handleOpen = () => {
      setIsConnected(true);
      setConnectionError(null);
    };

    const handleClose = () => {
      setIsConnected(false);
    };

    // const handleMessage = (message: WebSocketMessage) => {
    //   switch (message.type) {
    //     case "chat":
    //       setMessages((prev) => [...prev, message.data as ChatMessage]);
    //       setIsTyping(false);
    //       break;
    //     case "status": {
    //       const status = message.data as StatusData;
    //       setIsTyping(status.isTyping || false);
    //       break;
    //     }
    //     case "error": {
    //       const errorData = message.data as ErrorData;
    //       setConnectionError(errorData.message);
    //       break;
    //     }
    //   }
    // };

    // const handleError = (error: Error) => {
    //   console.error("[WebSocket Hook] Error:", error);
    //   setConnectionError(error.message || "Connection error");
    //   setIsConnected(false);
    // };

    // Set up event handlers
    wsService.on("open", handleOpen);
    wsService.on("close", handleClose);
    // wsService.on("message", handleMessage);
    // wsService.on("error", handleError);

    // Set initial state
    setIsConnected(wsService.isConnected());

    // Cleanup
    return () => {
      wsService.off("open", handleOpen);
      wsService.off("close", handleClose);
      // wsService.off("message", handleMessage);
      // wsService.off("error", handleError);
    };
  }, [wsService]);

  const sendMessage = useCallback(
    (message: string) => {
      if (wsService.isConnected()) {
        const userMessage: ChatMessage = {
          id: `user_${Date.now()}`,
          role: "user",
          content: message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        wsService.sendMessage("chat", {
          message,
          history: messages,
          timestamp: new Date(),
        });

        setIsTyping(true);
      }
    },
    [wsService, messages],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isConnected,
    messages,
    isTyping,
    sendMessage,
    clearMessages,
    connectionError,
  };
};

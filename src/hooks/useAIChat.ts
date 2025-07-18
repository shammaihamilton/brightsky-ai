import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { sendMessageToServer } from "../store/thunks/chatThunks";
import {
  addMessageOptimistic,
  setConnectionStatus,
} from "../store/slices/chatSlice";
import { createUserMessage } from "../utils/messageFactory";
import type { ConnectionStatus, Message } from "../types/chat.types";

export interface UseAIChatReturn {
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  isConfigured: boolean;
  connectionStatus: ConnectionStatus;
  conversationHistory: Message[];
  error: string | null;
}

export const useAIChat = (): UseAIChatReturn => {
  const dispatch = useDispatch<AppDispatch>();

  const { isAiLoading, connectionStatus, conversationHistory, currentError } =
    useSelector((state: RootState) => state.chat);

  const { isConfigured } = useSelector((state: RootState) => state.settings);

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      try {
        // Add user message to conversation using optimistic update
        const userMessage = createUserMessage(message.trim());
        dispatch(addMessageOptimistic(userMessage));

        // Update connection status to indicate sending
        dispatch(setConnectionStatus("connecting"));

        // Send message to AI service
        const result = await dispatch(
          sendMessageToServer({ userMessage: message.trim() }),
        );

        if (sendMessageToServer.fulfilled.match(result)) {
          dispatch(setConnectionStatus("connected"));
        } else {
          dispatch(setConnectionStatus("error"));
        }
      } catch (error) {
        console.error("Error sending message:", error);
        dispatch(setConnectionStatus("error"));
      }
    },
    [dispatch],
  );

  return {
    sendMessage,
    isLoading: isAiLoading,
    isConfigured,
    connectionStatus,
    conversationHistory,
    error: currentError,
  };
};

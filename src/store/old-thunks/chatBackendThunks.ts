import { createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import type { RootState, AppDispatch } from "../index";
import { addAiResponseChunk, setCurrentError } from "../slices/chatSlice";
import { ChatService, type ChatMessage } from "../../services/chatService";

const chatService = new ChatService();

interface SendMessagePayload {
  userMessage: string;
  options?: {
    directDbAccess?: boolean;
  };
}

export const sendMessageToBackend = createAsyncThunk<
  { response: string; messageId: string },
  SendMessagePayload,
  {
    dispatch: AppDispatch;
    state: RootState;
    rejectValue: string;
  }
>(
  "chat/sendMessageToBackend",
  async (payload, { dispatch, getState, rejectWithValue }) => {
    const { userMessage, options = {} } = payload;
    const state = getState();

    // Get configuration from Redux store
    const { provider } = state.settings;

    // Prepare chat history
    const chatHistory: ChatMessage[] = state.chat.conversationHistory
      .slice(-10)
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

    const messageId = uuidv4();

    try {
      // Send message to backend
      const response = await chatService.sendMessage(userMessage, chatHistory, {
        provider,
        directDbAccess: options.directDbAccess,
        onChunk: (chunk: string) => {
          dispatch(
            addAiResponseChunk({
              messageId,
              chunk,
              isFinal: false,
            }),
          );
        },
      });

      // Send final chunk
      dispatch(
        addAiResponseChunk({
          messageId,
          chunk: response,
          isFinal: true,
        }),
      );

      return { response, messageId };
    } catch (error) {
      console.error("Chat Service Error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      dispatch(setCurrentError(errorMessage));

      return rejectWithValue(errorMessage);
    }
  },
);

// New thunk for direct database access
export const queryDatabase = createAsyncThunk<
  { response: string; messageId: string },
  { query: string },
  {
    dispatch: AppDispatch;
    state: RootState;
    rejectValue: string;
  }
>(
  "chat/queryDatabase",
  async ({ query }, { dispatch, getState, rejectWithValue }) => {
    const state = getState();
    const chatHistory: ChatMessage[] = state.chat.conversationHistory
      .slice(-5)
      .map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text,
      }));

    const messageId = uuidv4();

    try {
      const response = await chatService.sendMessage(query, chatHistory, {
        provider: state.settings.provider,
        directDbAccess: true, // Enable direct database access
        onChunk: (chunk: string) => {
          dispatch(
            addAiResponseChunk({
              messageId,
              chunk,
              isFinal: false,
            }),
          );
        },
      });

      dispatch(
        addAiResponseChunk({
          messageId,
          chunk: response,
          isFinal: true,
        }),
      );

      return { response, messageId };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Database query failed";
      dispatch(setCurrentError(errorMessage));
      return rejectWithValue(errorMessage);
    }
  },
);

// Health check thunk to verify backend connectivity
export const checkBackendHealth = createAsyncThunk<
  { success: boolean; availableTools: string[]; version: string },
  void,
  {
    dispatch: AppDispatch;
    state: RootState;
    rejectValue: string;
  }
>("chat/checkBackendHealth", async (_, { rejectWithValue }) => {
  try {
    const healthData = await chatService.checkHealth();

    if (!healthData.success) {
      return rejectWithValue("Backend health check failed");
    }

    return healthData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Backend connectivity error";
    return rejectWithValue(errorMessage);
  }
});

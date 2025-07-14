import { createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import type { RootState, AppDispatch } from "../index";
import { addAiResponseChunk, dequeueMessage } from "../slices/chatSlice";
import { AIService, type ChatMessage } from "../../services/aiService";
import { MCPClient } from "../../services/mcp/MCPClient";
// import { MCPManager } from "../../services/mcp/MCPManager";
import { isValidConversationTone } from "../../services/ai/enums/AIProvider";

interface SendMessagePayload {
  userMessage: string;
}

interface ApiResponseSuccess {
  aiResponse?: string;
  streamId?: string;
  messageId?: string;
}

export const sendMessageToServer = createAsyncThunk<
  ApiResponseSuccess,
  SendMessagePayload,
  {
    dispatch: AppDispatch;
    state: RootState;
    rejectValue: string;
  }
>("chat/sendMessage", async (payload, thunkAPI) => {
  const { dispatch, getState, rejectWithValue } = thunkAPI;
  const { userMessage } = payload;

  const state = getState();
  const tone = state.chatSettings.tone;
  const {
    apiKey,
    provider,
    maxTokens,
    temperature,
    tools: enabledToolIds,
  } = state.settings;

  // Check if AI service is configured
  if (!apiKey || !provider) {
    return rejectWithValue(
      "AI service not configured. Please set up your API key and provider in settings.",
    );
  }

  const chatHistory: ChatMessage[] = state.chat.conversationHistory
    .slice(-10)
    .map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text,
    }));

  try {
    let aiService: AIService;
    const aiTone = isValidConversationTone(tone) ? tone : undefined;
    // Only pass tone if valid
    if (enabledToolIds.length > 0) {
      const baseAI = new AIService({
        provider,
        apiKey,
        maxTokens,
        temperature,
        tone: aiTone,
      });
      // const mcpManager = new MCPManager(enabledToolIds);
      aiService = new MCPClient(baseAI) as unknown as AIService;
    } else {
      aiService = new AIService({
        provider,
        apiKey,
        maxTokens,
        temperature,
        tone: aiTone,
      });
    }

    const aiResponse = await aiService.sendMessage(userMessage, chatHistory);

    if (aiResponse) {
      const aiMessageId = uuidv4();
      dispatch(
        addAiResponseChunk({
          messageId: aiMessageId,
          chunk: aiResponse,
          isFinal: true,
        }),
      );

      return {
        aiResponse,
        messageId: aiMessageId,
      };
    }

    return rejectWithValue("No response from AI service");
  } catch (error: unknown) {
    console.error("AI Service Error:", error);

    let message = "Failed to send message to AI service.";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    return rejectWithValue(message);
  }
});

export const loadChatHistory = createAsyncThunk(
  "chat/loadChatHistory",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const history = state.chat.conversationHistory;
    if (history.length > 0) {
      return history;
    }
    return [];
  },
);

export const syncOfflineQueue = createAsyncThunk<
  void,
  void,
  {
    dispatch: AppDispatch;
    state: RootState;
    rejectValue: string;
  }
>(
  "chat/syncOfflineQueue",
  async (_, { dispatch, getState, rejectWithValue }) => {
    const state = getState();
    const queuedMessages = state.chat.messageQueue;

    if (!navigator.onLine) {
      console.warn("Offline: Cannot sync queue");
      return rejectWithValue("Offline");
    }

    for (const message of queuedMessages) {
      try {
        const result = await dispatch(
          sendMessageToServer({ userMessage: message.text }),
        );

        if (sendMessageToServer.fulfilled.match(result)) {
          dispatch(dequeueMessage({ messageId: message.id }));
        } else {
          console.warn("Failed to send queued message:", message.text);
        }
      } catch (error) {
        console.error("Queue sync failed for:", message.id, error);
      }
    }
  },
);

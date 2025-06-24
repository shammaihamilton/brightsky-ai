import { createAsyncThunk } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";
import type { RootState, AppDispatch } from "../index"; 
import {
  updateMessageStatus,
  addAiResponseChunk,
  dequeueMessage,
} from "../slices/chatSlice"; 

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
>(
  "chat/sendMessage",
  async (payload, thunkAPI) => {
    const { dispatch, getState, rejectWithValue } = thunkAPI;
    const { userMessage } = payload;

    const state = getState();
    const tone = state.chatSettings.tone;
    const history = state.chat.conversationHistory
      .slice(-10)
      .map((msg) => ({ sender: msg.sender, text: msg.text }));    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage,
          chatTone: tone,
          history,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error ||
          `API Error: ${response.status} ${response.statusText}`;
        console.error("API Error Response:", errorMessage);
        return rejectWithValue(errorMessage);
      }      const data: ApiResponseSuccess = await response.json();

      if (data.aiResponse) {
        const aiMessageId = data.messageId || uuidv4();
        dispatch(
          addAiResponseChunk({
            messageId: aiMessageId,
            chunk: data.aiResponse,
            isFinal: true,
          })
        );
      } else {
        dispatch(
          updateMessageStatus({
            messageId: "some_way_to_identify_last_ai_message",
            status: "sent",
          })
        );
      }

      return data;
    } catch (error: unknown) {
      console.error("Thunk Error:", error);

      let message = "Failed to send message due to network or unexpected error.";
      if (error instanceof Error) {
        message = error.message;
      } else if (typeof error === "string") {
        message = error;
      }

      return rejectWithValue(message);
    }
  }
);


export const loadChatHistory = createAsyncThunk(
  "chat/loadChatHistory",
  async (_, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const history = state.chat.conversationHistory;
    if (history.length > 0) {
      return history;
    }
    return [];
  }
);

export const syncOfflineQueue = createAsyncThunk<
  void,
  void,
  {
    dispatch: AppDispatch;
    state: RootState;
    rejectValue: string;
  }
>("chat/syncOfflineQueue", async (_, { dispatch, getState, rejectWithValue }) => {
  const state = getState();
  const queuedMessages = state.chat.messageQueue;

  if (!navigator.onLine) {
    console.warn("Offline: Cannot sync queue");
    return rejectWithValue("Offline");
  }

  for (const message of queuedMessages) {
    try {
      const result = await dispatch(
        sendMessageToServer({ userMessage: message.text })
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
});

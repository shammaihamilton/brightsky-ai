import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  Message,
  ConnectionStatus,
  ButtonPositionState,
  Tone,
} from "../../types/chat.types";
import { safeLocalStorage } from "../../utils/safeLocalStorage";
import {
  createAiMessage,
  createQueuedMessage,
  createUserMessage,
} from "../../utils/messageFactory";
type OptimisticMessageInput = { text: string };
type QueueMessageInput = { text: string };

const findMessageIndex = (state: ChatState, id: string): number =>
  state.conversationHistory.findIndex((m) => m.id === id);
const findQueuedMessageIndex = (state: ChatState, id: string): number =>
  state.messageQueue.findIndex((m) => m.id === id);

export interface ChatState {
  isModalOpen: boolean;
  isButtonVisible: boolean;
  buttonPosition: ButtonPositionState | null;
  hasUnreadMessages: boolean;
  connectionStatus: ConnectionStatus;
  conversationHistory: Message[];
  messageQueue: Message[];
  isAiLoading: boolean;
  isTyping: boolean;
  currentError: string | null;
  tone: Tone;
}

const loadInitialButtonPosition = (): ButtonPositionState | null => {
  const saved = safeLocalStorage.getItem("chatButtonPosition");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse button position", e);
    }
  }
  return null;
};

const createInitialState = (): ChatState => {
  const settingsRaw = safeLocalStorage.getItem("chatSettings");
  let initialButtonVisibility = true;
  if (settingsRaw) {
    try {
      initialButtonVisibility =
        JSON.parse(settingsRaw).defaultButtonVisible ?? true;
    } catch {
      console.error("Failed to parse chat settings", settingsRaw);
      initialButtonVisibility = true; // Fallback to default if parsing fails
    }
  }

  return {
    isModalOpen: false,
    isButtonVisible: initialButtonVisibility,
    buttonPosition: loadInitialButtonPosition(),
    hasUnreadMessages: false,
    connectionStatus: "disconnected",
    conversationHistory: [],
    messageQueue: [],
    isAiLoading: false,
    isTyping: false,
    currentError: null,
    tone: "Professional",
  };
};

const initialState: ChatState = createInitialState();

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
      state.hasUnreadMessages = false;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
    },
    toggleButtonVisibility: (
      state,
      action: PayloadAction<boolean | undefined>,
    ) => {
      state.isButtonVisible =
        action.payload !== undefined ? action.payload : !state.isButtonVisible;
    },
    updateButtonPositionState: (
      state,
      action: PayloadAction<ButtonPositionState | null>,
    ) => {
      state.buttonPosition = action.payload;
      if (action.payload) {
        safeLocalStorage.setItem(
          "chatButtonPosition",
          JSON.stringify(action.payload),
        );
      } else {
        safeLocalStorage.removeItem("chatButtonPosition");
      }
    },
    setConnectionStatus: (state, action: PayloadAction<ConnectionStatus>) => {
      state.connectionStatus = action.payload;
      if (action.payload === "connected") state.currentError = null;
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    addMessageOptimistic: (
      state,
      action: PayloadAction<OptimisticMessageInput>,
    ) => {
      const newMessage = createUserMessage(action.payload.text);
      state.conversationHistory.push(newMessage);
      state.currentError = null;
      state.isAiLoading = true;
    },
    updateMessageStatus: (
      state,
      action: PayloadAction<{
        messageId: string;
        status: Message["status"];
        newText?: string;
        newTimestamp?: string;
      }>,
    ) => {
      const msgIndex = findMessageIndex(state, action.payload.messageId);

      if (msgIndex !== -1) {
        const msg = state.conversationHistory[msgIndex];
        msg.status = action.payload.status;
        if (action.payload.newText !== undefined)
          msg.text = action.payload.newText;
        if (action.payload.newTimestamp !== undefined)
          msg.timestamp = action.payload.newTimestamp;
        if (["sent", "failed"].includes(action.payload.status)) {
          if (
            msg.sender === "ai" &&
            msgIndex === state.conversationHistory.length - 1
          ) {
            state.isAiLoading = false;
          }
          if (action.payload.status === "failed") {
            state.currentError = `Message failed: ${
              action.payload.newText || msg.text.substring(0, 30)
            }...`;
          }
        }
      }
      const queueIndex = findQueuedMessageIndex(
        state,
        action.payload.messageId,
      );
      if (queueIndex !== -1) {
        if (action.payload.status === "sent") {
          state.messageQueue.splice(queueIndex, 1);
        } else if (action.payload.status === "failed") {
          state.messageQueue[queueIndex].status = "failed";
        }
      }
    },
    addAiResponseChunk: (
      state,
      action: PayloadAction<{
        messageId: string;
        chunk: string;
        isFinal?: boolean;
      }>,
    ) => {
      const { messageId, chunk, isFinal } = action.payload;

      const msgIndex = findMessageIndex(state, messageId);

      if (
        msgIndex !== -1 &&
        state.conversationHistory[msgIndex].sender === "ai"
      ) {
        const message = state.conversationHistory[msgIndex];

        // Initialize if missing
        if (!message.tokens) message.tokens = [];
        if (!message.seenChunks) message.seenChunks = [];

        // Prevent duplicate chunking
        if (!message.seenChunks.includes(chunk)) {
          message.tokens.push(chunk);
          message.seenChunks.push(chunk);
          message.text = message.tokens.join("");
        }

        message.status = "sent";
        state.isAiLoading = !isFinal;
        state.currentError = null;
      } else if (msgIndex === -1) {
        // First chunk of a new message
        const newMessage = createAiMessage(chunk, messageId);

        state.conversationHistory.push(newMessage);
        state.isAiLoading = !isFinal;
        state.currentError = null;

        if (!state.isModalOpen) {
          state.hasUnreadMessages = true;
        }
      }
    },
    loadHistory: (state, action: PayloadAction<Message[]>) => {
      state.conversationHistory = action.payload;
    },
    clearConversation: (state) => {
      state.conversationHistory = [];
      state.messageQueue = [];
      state.currentError = null;
      state.isAiLoading = false;
      state.hasUnreadMessages = false;
      state.isButtonVisible = true;
      state.isModalOpen = false;
      state.buttonPosition = null;
      safeLocalStorage.removeItem("chatButtonPosition");
      safeLocalStorage.removeItem("chatSettings");
    },
    setCurrentError: (state, action: PayloadAction<string | null>) => {
      state.currentError = action.payload;
      state.isAiLoading = false;
    },
    queueMessage: (state, action: PayloadAction<QueueMessageInput>) => {
      const newMessage = createQueuedMessage(action.payload.text);
      state.messageQueue.push(newMessage);
      const historyMessage: Message = {
        ...newMessage,
      };
      state.conversationHistory.push(historyMessage);
    },
    dequeueMessage: (state, action: PayloadAction<{ messageId: string }>) => {
      const queueIndex = findQueuedMessageIndex(
        state,
        action.payload.messageId,
      );
      if (queueIndex !== -1) {
        state.messageQueue.splice(queueIndex, 1);
      }
    },
    setTone: (state, action: PayloadAction<Tone>) => {
      state.tone = action.payload;
    },
  },
});

export const {
  openModal,
  closeModal,
  toggleButtonVisibility,
  updateButtonPositionState,
  setConnectionStatus,
  setTyping,
  addMessageOptimistic,
  updateMessageStatus,
  addAiResponseChunk,
  loadHistory,
  clearConversation,
  setCurrentError,
  queueMessage,
  dequeueMessage,
  setTone,
} = chatSlice.actions;

export default chatSlice.reducer;

// Selectors
export const selectConnectionStatus = (state: { chat: ChatState }) => state.chat.connectionStatus;
export const selectIsConnected = (state: { chat: ChatState }) => state.chat.connectionStatus === 'connected';
export const selectIsConnecting = (state: { chat: ChatState }) => state.chat.connectionStatus === 'connecting';
export const selectIsTyping = (state: { chat: ChatState }) => state.chat.isTyping;

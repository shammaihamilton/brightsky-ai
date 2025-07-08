import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Base selector
export const selectChatState = (state: RootState) => state.chat;

// UI state
export const selectIsButtonVisible = createSelector(
  [selectChatState],
  (chat) => chat.isButtonVisible
);

export const selectIsModalOpen = createSelector(
  [selectChatState],
  (chat) => chat.isModalOpen
);

export const selectButtonPosition = createSelector(
  [selectChatState],
  (chat) => chat.buttonPosition
);

// Connection
export const selectConnectionStatus = createSelector(
  [selectChatState],
  (chat) => chat.connectionStatus
);

export const selectCurrentError = createSelector(
  [selectChatState],
  (chat) => chat.currentError
);

export const selectIsChatReady = createSelector(
  [selectConnectionStatus, selectCurrentError],
  (status, error) => status === 'connected' && !error
);

// Messages
export const selectConversationHistory = createSelector(
  [selectChatState],
  (chat) => chat.conversationHistory
);

export const selectLatestMessage = createSelector(
  [selectConversationHistory],
  (history) => history.length > 0 ? history[history.length - 1] : null
);

export const selectMessageCount = createSelector(
  [selectConversationHistory],
  (history) => history.length
);

export const selectFailedMessages = createSelector(
  [selectConversationHistory],
  (history) => history.filter(msg => msg.status === 'failed')
);

export const selectPendingMessages = createSelector(
  [selectConversationHistory],
  (history) => history.filter(msg => msg.status === 'sending')
);

// Offline queue
export const selectMessageQueue = createSelector(
  [selectChatState],
  (chat) => chat.messageQueue
);

// Typing & Loading
export const selectIsAiLoading = createSelector(
  [selectChatState],
  (chat) => chat.isAiLoading
);

// Unread
export const selectUnreadMessageCount = createSelector(
  [selectChatState],
  (chat) => (chat.isModalOpen ? 0 : chat.hasUnreadMessages ? 1 : 0)
);

export const selectHasUnreadMessages = createSelector(
  [selectUnreadMessageCount],
  (count) => count > 0
);



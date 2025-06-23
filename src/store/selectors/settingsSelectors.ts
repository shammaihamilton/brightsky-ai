import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../index";

// Base selector
export const selectChatSettingsState = (state: RootState) => state.chatSettings;

// Basic settings
export const selectAssistantName = createSelector(
  [selectChatSettingsState],
  (settings) => settings.assistantName
);

export const selectAssistantAvatar = createSelector(
  [selectChatSettingsState],
  (settings) => settings.assistantAvatar
);

export const selectTheme = createSelector(
  [selectChatSettingsState],
  (settings) => settings.theme
);

export const selectPrivacySettings = createSelector(
  [selectChatSettingsState],
  (settings) => settings.privacy
);

export const selectAccessibilitySettings = createSelector(
  [selectChatSettingsState],
  (settings) => settings.accessibility
);

export const selectBubbleStyle = createSelector(
  [selectChatSettingsState],
  (settings) => settings.bubbleStyle
);

export const selectFontSize = createSelector(
  [selectChatSettingsState],
  (settings) => settings.fontSize
);

export const selectDefaultPosition = createSelector(
  [selectChatSettingsState],
  (settings) => settings.defaultPosition
);

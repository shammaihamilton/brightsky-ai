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

// API Settings selectors
export const selectSettingsState = (state: RootState) => state.settings;

export const selectApiKey = createSelector(
  [selectSettingsState],
  (settings) => settings.apiKey
);

export const selectProvider = createSelector(
  [selectSettingsState],
  (settings) => settings.provider
);

export const selectApiSettings = createSelector(
  [selectSettingsState],
  (settings) => ({
    apiKey: settings.apiKey,
    provider: settings.provider,
    maxTokens: settings.maxTokens,
    temperature: settings.temperature,
    isConfigured: settings.isConfigured,
  })
);

export const selectIsConfigured = createSelector(
  [selectSettingsState],
  (settings) => settings.isConfigured
);

export const selectMaxTokens = createSelector(
  [selectSettingsState],
  (settings) => settings.maxTokens
);

export const selectTemperature = createSelector(
  [selectSettingsState],
  (settings) => settings.temperature
);

export const selectApiTheme = createSelector(
  [selectSettingsState],
  (settings) => settings.theme
);

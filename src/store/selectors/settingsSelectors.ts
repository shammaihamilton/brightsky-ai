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

export const selectTone = createSelector(
  [selectChatSettingsState],
  (settings) => settings.tone
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

export const selectButtonSize = createSelector(
  [selectChatSettingsState],
  (settings) => settings.buttonSize
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

// Combined selectors that merge both settings slices
export const selectAllSettings = createSelector(
  [selectSettingsState, selectChatSettingsState],
  (apiSettings, chatSettings) => ({
    // API/Extension settings
    apiKey: apiSettings.apiKey,
    provider: apiSettings.provider,
    maxTokens: apiSettings.maxTokens,
    temperature: apiSettings.temperature,
    isConfigured: apiSettings.isConfigured,
    
    // Chat UI/UX settings
    assistantName: chatSettings.assistantName,
    tone: chatSettings.tone,
    theme: chatSettings.theme, // Chat theme (synced from API theme)
    apiTheme: apiSettings.theme, // API theme (master)
    buttonSize: chatSettings.buttonSize,
    defaultPosition: chatSettings.defaultPosition,
    notifications: chatSettings.notifications,
    accessibility: chatSettings.accessibility,
    privacy: chatSettings.privacy,
  })
);

// Helper to get current effective theme
export const selectEffectiveTheme = createSelector(
  [selectSettingsState, selectChatSettingsState],
  (apiSettings, chatSettings) => {
    // API theme takes precedence, but fallback to chat theme
    const apiTheme = apiSettings.theme;
    const chatTheme = chatSettings.theme;
    
    // Check API theme first
    if (apiTheme === 'auto') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    
    // Check chat theme for system preference
    if (chatTheme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'light';
    }
    
    // Return explicit theme preference
    return apiTheme || chatTheme || 'light';
  }
);

export const selectApiTheme = createSelector(
  [selectSettingsState],
  (settings) => settings.theme
);

export const selectNotificationSettings = createSelector(
  [selectChatSettingsState],
  (settings) => settings.notifications
);

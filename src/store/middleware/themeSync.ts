// src/store/middleware/themeSync.ts
import { createListenerMiddleware } from '@reduxjs/toolkit';
import { setTheme } from '../slices/settingsSlice';
import { syncThemeFromApiSettings } from '../slices/chatSettingsSlice';

// Create middleware to sync themes between settings slices
export const themeSyncMiddleware = createListenerMiddleware();

// Listen for theme changes in API settings and sync to chat settings
themeSyncMiddleware.startListening({
  actionCreator: setTheme,
  effect: (action, listenerApi) => {
    // Sync the theme to chat settings
    listenerApi.dispatch(syncThemeFromApiSettings(action.payload));
  },
});

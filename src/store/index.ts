// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./slices/chatSlice";
import chatSettingsReducer from "./slices/chatSettingsSlice";
import settingsReducer from "./slices/settingsSlice";
import { themeSyncMiddleware } from "./middleware/themeSync";

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    chatSettings: chatSettingsReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serialization checks if you add persistence later
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }).prepend(themeSyncMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

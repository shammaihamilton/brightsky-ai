// src/store/slices/chatSettingsSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ChatSettings } from "../../types/chat.types";
import { safeLocalStorage } from "../../utils/safeLocalStorage";

export type ChatSettingsState = ChatSettings;

const ALLOWED_DEFAULT_POSITIONS = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
] as const;
type AllowedDefaultPositionType = (typeof ALLOWED_DEFAULT_POSITIONS)[number];

const DEFAULT_CHAT_SETTINGS: ChatSettingsState = {
  assistantName: "BrightSky",
  assistantAvatar: undefined,
  tone: "Friendly",
  theme: "system", // This can sync with settings.theme
  privacy: {
    saveHistory: true,
    autoClearDays: 30,
  },
  defaultButtonVisible: true,
  buttonSize: "medium",
  defaultPosition: "bottom-right",
  bubbleStyle: "modern",
  fontSize: "medium",
  notifications: {
    soundEnabled: true,
    emailSummary: true,
    desktopNotifications: false,
  },
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    screenReaderOptimized: true,
  },
};
const loadInitialSettings = (): ChatSettingsState => {
  const savedSettings = safeLocalStorage.getItem("chatSettings");

  if (savedSettings) {
    try {
      // const parsed = JSON.parse(savedSettings);
      const parsed = JSON.parse(savedSettings) as Partial<
        Omit<ChatSettingsState, "defaultPosition"> & {
          defaultPosition?: string;
        }
      >;
      let validatedDefaultPosition: AllowedDefaultPositionType | undefined =
        DEFAULT_CHAT_SETTINGS.defaultPosition as AllowedDefaultPositionType;
      if (parsed.defaultPosition !== undefined) {
        if (
          ALLOWED_DEFAULT_POSITIONS.includes(
            parsed.defaultPosition as AllowedDefaultPositionType
          )
        ) {
          validatedDefaultPosition =
            parsed.defaultPosition as AllowedDefaultPositionType;
        } else {
          console.warn(
            `Invalid defaultPosition value "${parsed.defaultPosition}" found in localStorage. ` +
              `Using default value "${DEFAULT_CHAT_SETTINGS.defaultPosition}".`
          );
          // validatedDefaultPosition remains DEFAULT_CHAT_SETTINGS.defaultPosition
        }
      }
      const mergedSettings = {
          ...DEFAULT_CHAT_SETTINGS, // Spread the rest of parsed settings
          ...parsed,
        defaultPosition: validatedDefaultPosition,
        notifications: {
          ...DEFAULT_CHAT_SETTINGS.notifications,
          ...(parsed.notifications || {}),
        },
        privacy: {
          ...DEFAULT_CHAT_SETTINGS.privacy,
          ...(parsed.privacy || {}),
        },
        accessibility: {
          ...DEFAULT_CHAT_SETTINGS.accessibility,
          ...(parsed.accessibility || {}),
        },
      };

      return mergedSettings as ChatSettingsState;
    } catch (e) {
      console.error("Failed to parse chatSettings from localStorage", e);

      return DEFAULT_CHAT_SETTINGS;
    }
  }
  return DEFAULT_CHAT_SETTINGS;
};

const initialState: ChatSettingsState = loadInitialSettings();

export const chatSettingsSlice = createSlice({
  name: "chatSettings",
  initialState,
  reducers: {
    updateChatSettings: (
      state,
      action: PayloadAction<Partial<ChatSettingsState>>
    ) => {
      const newState = {
        ...state,
        ...action.payload,
        notifications: {
          ...state.notifications,
          ...(action.payload.notifications || {}),
        },
        privacy: { ...state.privacy, ...(action.payload.privacy || {}) },
        accessibility: {
          ...state.accessibility,
          ...(action.payload.accessibility || {}),
        },
      };
      Object.assign(state, newState);
      safeLocalStorage.setItem("chatSettings", JSON.stringify(newState));
    },
    resetChatSettings: (state) => {
      Object.assign(state, DEFAULT_CHAT_SETTINGS); // Use the canonical defaults
      safeLocalStorage.removeItem("chatSettings"); // Remove instead of setting defaults
    },    importChatSettings: (state, action: PayloadAction<ChatSettingsState>) => {
      const validatedSettings = action.payload;
      Object.assign(state, validatedSettings);
      safeLocalStorage.setItem(
        "chatSettings",
        JSON.stringify(validatedSettings)
      );
    },
    // Sync theme from API settings to chat settings
    syncThemeFromApiSettings: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      const themeMap = {
        'auto': 'system',
        'light': 'light', 
        'dark': 'dark'
      } as const;
      
      state.theme = themeMap[action.payload] || 'system';
      const newState = { ...state };
      safeLocalStorage.setItem("chatSettings", JSON.stringify(newState));
    },
  },
});

export const { 
  updateChatSettings, 
  resetChatSettings, 
  importChatSettings,
  syncThemeFromApiSettings 
} = chatSettingsSlice.actions;
export default chatSettingsSlice.reducer;

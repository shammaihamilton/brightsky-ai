import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  apiKey: string;
  provider: 'openai' | 'claude' | 'gemini';
  theme: 'light' | 'dark' | 'auto';
  autoSave: boolean;
  maxTokens: number;
  temperature: number;
  isConfigured: boolean;
}

const initialState: SettingsState = {
  apiKey: '',
  provider: 'openai',
  theme: 'auto',
  autoSave: true,
  maxTokens: 4000,
  temperature: 0.7,
  isConfigured: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload;
      state.isConfigured = action.payload.length > 0;
    },
    setProvider: (state, action: PayloadAction<'openai' | 'claude' | 'gemini'>) => {
      state.provider = action.payload;
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    setAutoSave: (state, action: PayloadAction<boolean>) => {
      state.autoSave = action.payload;
    },
    setMaxTokens: (state, action: PayloadAction<number>) => {
      state.maxTokens = action.payload;
    },
    setTemperature: (state, action: PayloadAction<number>) => {
      state.temperature = action.payload;
    },
    resetSettings: (state) => {
      Object.assign(state, initialState);
    },
    loadSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
      state.isConfigured = (action.payload.apiKey?.length ?? 0) > 0;
    },
  },
});

export const {
  setApiKey,
  setProvider,
  setTheme,
  setAutoSave,
  setMaxTokens,
  setTemperature,
  resetSettings,
  loadSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;

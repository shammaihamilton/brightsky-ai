import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setApiKey,
  setProvider,
  setTheme,
  setMaxTokens,
  setTemperature,
  loadSettings,
} from '../../store/slices/settingsSlice';
import { updateChatSettings } from '../../store/slices/chatSettingsSlice';
import {
  selectApiKey,
  selectProvider,
  selectApiTheme,
  selectIsConfigured,
  selectMaxTokens,
  selectTemperature,
  selectChatSettingsState,
} from '../../store/selectors/settingsSelectors';
import { ApiKeySecurity } from '../../utils/apiKeySecurity';
import type { Tone, ButtonSize } from '../../types/chat.types';

interface ApiSettings {
  apiKey?: string;
  provider?: 'openai' | 'claude' | 'gemini';
  theme?: 'light' | 'dark' | 'auto';
  maxTokens?: number;
  temperature?: number;
}

interface ChromeStorageResult {
  apiSettings?: ApiSettings;
}

export interface UseSettingsManagerReturn {
  // Current state
  apiSettings: {
    apiKey: string;
    provider: 'openai' | 'claude' | 'gemini';
    theme: 'light' | 'dark' | 'auto';
    maxTokens: number;
    temperature: number;
    isConfigured: boolean;
  };
    chatSettings: {
    assistantName: string;
    tone: string;
    buttonSize: string;
    notifications: {
      soundEnabled?: boolean;
      desktopNotifications?: boolean;
      emailSummary?: boolean;
    } | null;
    privacy: {
      saveHistory: boolean;
      autoClearDays: number;
    };
    accessibility: {
      highContrast: boolean;
      reducedMotion: boolean;
      screenReaderOptimized: boolean;
    };
  };
  
  // Local UI state
  localApiKey: string;
  showApiKey: boolean;
  showAdvanced: boolean;
  showChatSettings: boolean;
  isSaving: boolean;
  isSettingsSaved: boolean;
  keyValidationError: string | null;
  
  // Actions
  actions: {
    // API Key actions
    setLocalApiKey: (key: string) => void;
    toggleApiKeyVisibility: () => void;
    handleSaveApiKey: () => Promise<void>;
    
    // Settings actions
    handleProviderChange: (provider: 'openai' | 'claude' | 'gemini') => void;
    handleThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
    handleMaxTokensChange: (tokens: number) => void;
    handleTemperatureChange: (temp: number) => void;
      // Chat settings actions
    handleAssistantNameChange: (name: string) => void;
    handleToneChange: (tone: string) => void;
    handleButtonSizeChange: (size: string) => void;
    handleNotificationChange: (key: string, value: boolean) => void;
    handleChatSettingsChange: (updates: Record<string, unknown>) => void;
    
    // UI actions
    toggleAdvanced: () => void;
    toggleChatSettings: () => void;
  };
  
  // Utilities
  utils: {
    getProviderHelp: () => string;
    applyTheme: (theme: 'light' | 'dark' | 'auto') => void;
  };
}

export const useSettingsManager = (): UseSettingsManagerReturn => {
  const dispatch = useAppDispatch();
  
  // Redux selectors
  const apiKey = useAppSelector(selectApiKey);
  const provider = useAppSelector(selectProvider);
  const theme = useAppSelector(selectApiTheme);
  const isConfigured = useAppSelector(selectIsConfigured);
  const maxTokens = useAppSelector(selectMaxTokens);
  const temperature = useAppSelector(selectTemperature);
  const chatSettings = useAppSelector(selectChatSettingsState);
  
  // Local state
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);

  // Load settings from Chrome storage on mount
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['apiSettings', 'chatSettings'], (result: ChromeStorageResult & { chatSettings?: Record<string, unknown> }) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome storage error:', chrome.runtime.lastError);
        } else {
          // Load API settings
          if (result.apiSettings) {
            const settings = result.apiSettings;
            const deobfuscatedKey = settings.apiKey
              ? ApiKeySecurity.deobfuscate(settings.apiKey)
              : '';

            dispatch(loadSettings({
              ...settings,
              apiKey: deobfuscatedKey,
            }));
            setLocalApiKey(deobfuscatedKey);
          }
          
          // Load chat settings
          if (result.chatSettings) {
            dispatch(updateChatSettings(result.chatSettings));
          }
        }
      });
    }
  }, [dispatch]);

  // Apply theme when it changes
  const applyTheme = useCallback((themeValue: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    if (themeValue === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', themeValue);
    }
  }, []);

  useEffect(() => {
    applyTheme(theme as 'light' | 'dark' | 'auto');
  }, [theme, applyTheme]);

  // Utility functions
  const getProviderHelp = useCallback(() => {
    switch (provider) {
      case 'openai': return 'Get your API key from platform.openai.com';
      case 'claude': return 'Get your API key from console.anthropic.com';
      case 'gemini': return 'Get your API key from makersuite.google.com';
      default: return 'Enter your API key';
    }
  }, [provider]);

  const saveToStorage = useCallback((updates: Partial<ApiSettings>) => {
    chrome.storage.sync.get(['apiSettings'], (result: ChromeStorageResult) => {
      const currentSettings = result.apiSettings || {};
      const newSettings = { ...currentSettings, ...updates };

      if (updates.apiKey !== undefined) {
        newSettings.apiKey = updates.apiKey
          ? ApiKeySecurity.obfuscate(updates.apiKey)
          : '';
      }

      chrome.storage.sync.set({ apiSettings: newSettings });
    });
  }, []);

  const saveChatSettingsToStorage = useCallback((updates: Record<string, unknown>) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['chatSettings'], (result) => {
        const currentChatSettings = result.chatSettings || {};
        const newChatSettings = { ...currentChatSettings, ...updates };
        
        chrome.storage.sync.set({ chatSettings: newChatSettings }, () => {
          console.log('Chat settings saved to storage');
        });
      });
    }
  }, []);

  // Action handlers
  const handleSaveApiKey = useCallback(async () => {
    if (localApiKey && !ApiKeySecurity.validateKeyFormat(localApiKey, provider)) {
      setKeyValidationError(`Invalid ${provider} API key format`);
      return;
    }

    setKeyValidationError(null);
    setIsSaving(true);
    dispatch(setApiKey(localApiKey));

    const obfuscatedKey = localApiKey ? ApiKeySecurity.obfuscate(localApiKey) : '';
    const settings = {
      apiKey: obfuscatedKey,
      provider,
      theme,
      maxTokens,
      temperature,
    };

    chrome.storage.sync.set({ apiSettings: settings }, () => {
      setIsSaving(false);
      setIsSettingsSaved(true);
      // Hide success message after 2 seconds
      setTimeout(() => setIsSettingsSaved(false), 2000);
    });
  }, [localApiKey, provider, theme, maxTokens, temperature, dispatch]);

  const handleProviderChange = useCallback((newProvider: 'openai' | 'claude' | 'gemini') => {
    dispatch(setProvider(newProvider));
    saveToStorage({ provider: newProvider });
  }, [dispatch, saveToStorage]);

  const handleThemeChange = useCallback((newTheme: 'light' | 'dark' | 'auto') => {
    dispatch(setTheme(newTheme));
    saveToStorage({ theme: newTheme });
    applyTheme(newTheme);
  }, [dispatch, saveToStorage, applyTheme]);

  const handleMaxTokensChange = useCallback((newMaxTokens: number) => {
    dispatch(setMaxTokens(newMaxTokens));
    saveToStorage({ maxTokens: newMaxTokens });
  }, [dispatch, saveToStorage]);

  const handleTemperatureChange = useCallback((newTemperature: number) => {
    dispatch(setTemperature(newTemperature));
    saveToStorage({ temperature: newTemperature });
  }, [dispatch, saveToStorage]);
  const handleChatSettingsChange = useCallback((updates: Record<string, unknown>) => {
    dispatch(updateChatSettings(updates));
    saveChatSettingsToStorage(updates);
    
    // Show success feedback for chat settings
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 2000);
  }, [dispatch, saveChatSettingsToStorage]);

  const handleAssistantNameChange = useCallback((name: string) => {
    handleChatSettingsChange({ assistantName: name });
  }, [handleChatSettingsChange]);

  const handleToneChange = useCallback((tone: string) => {
    handleChatSettingsChange({ tone: tone as Tone });
  }, [handleChatSettingsChange]);

  const handleButtonSizeChange = useCallback((buttonSize: string) => {
    handleChatSettingsChange({ buttonSize: buttonSize as ButtonSize });
  }, [handleChatSettingsChange]);

  const handleNotificationChange = useCallback((key: string, value: boolean) => {
    if (chatSettings.notifications) {
      handleChatSettingsChange({
        notifications: {
          ...chatSettings.notifications,
          [key]: value,
        },
      });
    }
  }, [chatSettings.notifications, handleChatSettingsChange]);

  return {
    apiSettings: {
      apiKey,
      provider,
      theme,
      maxTokens,
      temperature,
      isConfigured,
    },    chatSettings: {
      assistantName: chatSettings.assistantName || '',
      tone: chatSettings.tone || 'Professional',
      buttonSize: chatSettings.buttonSize || 'medium',
      notifications: chatSettings.notifications || null,
      privacy: {
        saveHistory: chatSettings.privacy?.saveHistory || false,
        autoClearDays: chatSettings.privacy?.autoClearDays || 30,
      },
      accessibility: chatSettings.accessibility || {
        highContrast: false,
        reducedMotion: false,
        screenReaderOptimized: false,
      },
    },
    localApiKey,
    showApiKey,
    showAdvanced,
    showChatSettings,
    isSaving,
    isSettingsSaved,
    keyValidationError,
    actions: {
      setLocalApiKey: (key: string) => {
        setLocalApiKey(key);
        if (keyValidationError) setKeyValidationError(null);
      },
      toggleApiKeyVisibility: () => setShowApiKey(!showApiKey),
      handleSaveApiKey,
      handleProviderChange,
      handleThemeChange,
      handleMaxTokensChange,
      handleTemperatureChange,
      handleAssistantNameChange,
      handleToneChange,
      handleButtonSizeChange,
      handleNotificationChange,
      handleChatSettingsChange,
      toggleAdvanced: () => setShowAdvanced(!showAdvanced),
      toggleChatSettings: () => setShowChatSettings(!showChatSettings),
    },
    utils: {
      getProviderHelp,
      applyTheme,
    },
  };
};

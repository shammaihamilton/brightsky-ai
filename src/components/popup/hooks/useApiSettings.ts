import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setApiKey,
  setProvider,
  setTheme,
  setMaxTokens,
  setTemperature,
  loadSettings as loadSettingsAction,
} from '../../../store/slices/settingsSlice';
import {
  selectApiKey,
  selectProvider,
  selectApiTheme,
  selectIsConfigured,
  selectMaxTokens,
  selectTemperature,
} from '../../../store/selectors/settingsSelectors';
import { ApiKeySecurity } from '../../../utils/apiKeySecurity';
import { useChromeStorage } from './useChromeStorage';

export interface UseApiSettingsReturn {
  apiSettings: {
    apiKey: string;
    provider: 'openai' | 'claude' | 'gemini';
    theme: 'light' | 'dark' | 'auto';
    maxTokens: number;
    temperature: number;
    isConfigured: boolean;

  };
  
  // Local UI state
  localApiKey: string;
  showApiKey: boolean;
  showAdvanced: boolean;
  isSaving: boolean;
  keyValidationError: string | null;
  
  // Actions
  actions: {
    setLocalApiKey: (key: string) => void;
    toggleApiKeyVisibility: () => void;
    handleSaveApiKey: () => Promise<void>;
    handleProviderChange: (provider: 'openai' | 'claude' | 'gemini') => void;
    handleThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
    handleMaxTokensChange: (tokens: number) => void;
    handleTemperatureChange: (temp: number) => void;
    toggleAdvanced: () => void;

  };
  
  // Utilities
  utils: {
    getProviderHelp: () => string;
    applyTheme: (theme: 'light' | 'dark' | 'auto') => void;
  };
}

export const useApiSettings = (): UseApiSettingsReturn => {
  const dispatch = useAppDispatch();
  const { loadApiSettings, saveApiSettings } = useChromeStorage();
  
  // Redux selectors
  const apiKey = useAppSelector(selectApiKey);
  const provider = useAppSelector(selectProvider);
  const theme = useAppSelector(selectApiTheme);
  const isConfigured = useAppSelector(selectIsConfigured);
  const maxTokens = useAppSelector(selectMaxTokens);
  const temperature = useAppSelector(selectTemperature);
  
  // Local state
  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);

  // Load settings from Chrome storage on mount
  useEffect(() => {
    const loadSettingsFromStorage = async () => {
      const settings = await loadApiSettings();
      if (settings) {
        dispatch(loadSettingsAction(settings));
        setLocalApiKey(settings.apiKey || '');
      }
    };
    
    loadSettingsFromStorage();
  }, [dispatch, loadApiSettings]);

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

  // Action handlers
  const handleSaveApiKey = useCallback(async () => {
    if (localApiKey && !ApiKeySecurity.validateKeyFormat(localApiKey, provider)) {
      setKeyValidationError(`Invalid ${provider} API key format`);
      return;
    }

    setKeyValidationError(null);
    setIsSaving(true);
    dispatch(setApiKey(localApiKey));

    try {
      await saveApiSettings({
        apiKey: localApiKey,
        provider,
        theme,
        maxTokens,
        temperature,

      });
      setIsSaving(false);
    } catch (error) {
      console.error('Failed to save API settings:', error);
      setIsSaving(false);
    }
  }, [localApiKey, provider, theme, maxTokens, temperature, dispatch, saveApiSettings]);

  const handleProviderChange = useCallback(async (newProvider: 'openai' | 'claude' | 'gemini') => {
    dispatch(setProvider(newProvider));
    await saveApiSettings({ provider: newProvider });
  }, [dispatch, saveApiSettings]);

  const handleThemeChange = useCallback(async (newTheme: 'light' | 'dark' | 'auto') => {
    dispatch(setTheme(newTheme));
    await saveApiSettings({ theme: newTheme });
    applyTheme(newTheme);
  }, [dispatch, saveApiSettings, applyTheme]);

  const handleMaxTokensChange = useCallback(async (newMaxTokens: number) => {
    dispatch(setMaxTokens(newMaxTokens));
    await saveApiSettings({ maxTokens: newMaxTokens });
  }, [dispatch, saveApiSettings]);

  const handleTemperatureChange = useCallback(async (newTemperature: number) => {
    dispatch(setTemperature(newTemperature));
    await saveApiSettings({ temperature: newTemperature });
  }, [dispatch, saveApiSettings]);

  return {
    apiSettings: {
      apiKey,
      provider,
      theme,
      maxTokens,
      temperature,
      isConfigured,
    },
    localApiKey,
    showApiKey,
    showAdvanced,
    isSaving,
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
      toggleAdvanced: () => setShowAdvanced(!showAdvanced),
    },
    utils: {
      getProviderHelp,
      applyTheme,
    },
  };
};

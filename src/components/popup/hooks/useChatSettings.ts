import { useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { updateChatSettings } from '../../../store/slices/chatSettingsSlice';
import { selectChatSettingsState } from '../../../store/selectors/settingsSelectors';
import { useChromeStorage } from './useChromeStorage';
import type { Tone, ButtonSize } from '../../../types/chat.types';

export interface UseChatSettingsReturn {
  // Current state
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
  showChatSettings: boolean;
  isSettingsSaved: boolean;
  
  // Actions
  actions: {
    handleAssistantNameChange: (name: string) => void;
    handleToneChange: (tone: string) => void;
    handleButtonSizeChange: (size: string) => void;
    handleNotificationChange: (key: string, value: boolean) => void;
    handleChatSettingsChange: (updates: Record<string, unknown>) => void;
    toggleChatSettings: () => void;
    setIsSettingsSaved: (saved: boolean) => void;
  };
}

export const useChatSettings = (): UseChatSettingsReturn => {
  const dispatch = useAppDispatch();
  const { loadChatSettings, saveChatSettings } = useChromeStorage();
  
  // Redux selectors
  const chatSettings = useAppSelector(selectChatSettingsState);
  
  // Local state
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Load chat settings from Chrome storage on mount
  useEffect(() => {
    const loadSettingsFromStorage = async () => {
      const settings = await loadChatSettings();
      if (settings) {
        dispatch(updateChatSettings(settings));
      }
    };
    
    loadSettingsFromStorage();
  }, [dispatch, loadChatSettings]);

  // Main chat settings change handler
  const handleChatSettingsChange = useCallback(async (updates: Record<string, unknown>) => {
    dispatch(updateChatSettings(updates));
    
    try {
      await saveChatSettings(updates);
      
      // Show success feedback for chat settings
      setIsSettingsSaved(true);
      setTimeout(() => setIsSettingsSaved(false), 2000);
    } catch (error) {
      console.error('Failed to save chat settings:', error);
    }
  }, [dispatch, saveChatSettings]);

  // Specific setting handlers
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
    chatSettings: {
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
    showChatSettings,
    isSettingsSaved,
    actions: {
      handleAssistantNameChange,
      handleToneChange,
      handleButtonSizeChange,
      handleNotificationChange,
      handleChatSettingsChange,
      toggleChatSettings: () => setShowChatSettings(!showChatSettings),
      setIsSettingsSaved,
    },
  };
};

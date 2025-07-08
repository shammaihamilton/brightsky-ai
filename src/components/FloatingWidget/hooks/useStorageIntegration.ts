import { useEffect, useCallback } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { loadSettings } from '../../../store/slices/settingsSlice';
import { updateChatSettings } from '../../../store/slices/chatSettingsSlice';
import { ExtensionContext } from '../../../utils/extensionContext';
import { useWidgetStorage } from './index';

export const useStorageIntegration = () => {
  const dispatch = useAppDispatch();
  const storageService = useWidgetStorage();

  const loadSettingsFromStorage = useCallback(async () => {
    await ExtensionContext.safeCall(async () => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.get(["apiSettings", "chatSettings"], (result) => {
          if (chrome.runtime.lastError) {
            console.error("Chrome storage error:", chrome.runtime.lastError);
            return;
          }

          if (result.apiSettings) {
            dispatch(loadSettings(result.apiSettings));
          }
          
          if (result.chatSettings) {
            dispatch(updateChatSettings(result.chatSettings));
          }
        });
      }
    });
  }, [dispatch]);

  const handleStorageChange = useCallback((
    changes: Record<string, chrome.storage.StorageChange>, 
    areaName: string
  ) => {
    if (areaName === 'sync') {
      console.log('Storage changed:', changes);
      
      if (changes.chatSettings) {
        dispatch(updateChatSettings(changes.chatSettings.newValue));
      }
      
      if (changes.apiSettings) {
        dispatch(loadSettings(changes.apiSettings.newValue));
      }
    }
  }, [dispatch]);

  // Initialize storage services and load settings from Chrome storage
  useEffect(() => {
    // Load settings and watch for changes
    loadSettingsFromStorage();
    storageService.loadSettings();
    const cleanup = storageService.watchStorageChanges();
    return cleanup;
  }, [storageService, loadSettingsFromStorage]);

  // Chrome storage change listener for real-time updates
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, [handleStorageChange]);
};

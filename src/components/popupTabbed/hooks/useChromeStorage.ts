import { useCallback } from 'react';
import { ApiKeySecurity } from '../../../utils/apiKeySecurity';

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

export interface UseChromeStorageReturn {
  loadApiSettings: () => Promise<ApiSettings | null>;
  saveApiSettings: (settings: Partial<ApiSettings>) => Promise<void>;
  loadChatSettings: () => Promise<Record<string, unknown> | null>;
  saveChatSettings: (updates: Record<string, unknown>) => Promise<void>;
}

export const useChromeStorage = (): UseChromeStorageReturn => {
  const loadApiSettings = useCallback((): Promise<ApiSettings | null> => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['apiSettings'], (result: ChromeStorageResult) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome storage error:', chrome.runtime.lastError);
            resolve(null);
          } else if (result.apiSettings) {
            const settings = result.apiSettings;
            const deobfuscatedKey = settings.apiKey
              ? ApiKeySecurity.deobfuscate(settings.apiKey)
              : '';

            resolve({
              ...settings,
              apiKey: deobfuscatedKey,
            });
          } else {
            resolve(null);
          }
        });
      } else {
        resolve(null);
      }
    });
  }, []);

  const saveApiSettings = useCallback((updates: Partial<ApiSettings>): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['apiSettings'], (result: ChromeStorageResult) => {
          const currentSettings = result.apiSettings || {};
          const newSettings = { ...currentSettings, ...updates };

          if (updates.apiKey !== undefined) {
            newSettings.apiKey = updates.apiKey
              ? ApiKeySecurity.obfuscate(updates.apiKey)
              : '';
          }

          chrome.storage.sync.set({ apiSettings: newSettings }, () => {
            if (chrome.runtime.lastError) {
              console.error('Chrome storage error:', chrome.runtime.lastError);
            }
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
  }, []);

  const loadChatSettings = useCallback((): Promise<Record<string, unknown> | null> => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['chatSettings'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome storage error:', chrome.runtime.lastError);
            resolve(null);
          } else {
            resolve(result.chatSettings || null);
          }
        });
      } else {
        resolve(null);
      }
    });
  }, []);

  const saveChatSettings = useCallback((updates: Record<string, unknown>): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['chatSettings'], (result) => {
          const currentChatSettings = result.chatSettings || {};
          const newChatSettings = { ...currentChatSettings, ...updates };

          chrome.storage.sync.set({ chatSettings: newChatSettings }, () => {
            if (chrome.runtime.lastError) {
              console.error('Chrome storage error:', chrome.runtime.lastError);
            } else {
              console.log('Chat settings saved to storage');
            }
            resolve();
          });
        });
      } else {
        resolve();
      }
    });
  }, []);

  return {
    loadApiSettings,
    saveApiSettings,
    loadChatSettings,
    saveChatSettings,
  };
}; 
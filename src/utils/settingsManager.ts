// Utility to get API settings with deobfuscation for content script usage
import { ApiKeySecurity } from './apiKeySecurity';

export interface DeobfuscatedApiSettings {
  apiKey: string;
  provider: 'openai' | 'claude' | 'gemini';
  theme: 'light' | 'dark' | 'auto';
  maxTokens: number;
  temperature: number;
}

export class SettingsManager {
  // Get API settings with deobfuscated key
  static async getApiSettings(): Promise<DeobfuscatedApiSettings | null> {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get(['apiSettings'], (result) => {
          if (chrome.runtime.lastError) {
            console.error('Failed to load API settings:', chrome.runtime.lastError);
            resolve(null);
            return;
          }

          if (result.apiSettings) {
            const settings = result.apiSettings;
            
            // Deobfuscate the API key
            const deobfuscatedKey = settings.apiKey ? ApiKeySecurity.deobfuscate(settings.apiKey) : '';
            
            resolve({
              apiKey: deobfuscatedKey,
              provider: settings.provider || 'openai',
              theme: settings.theme || 'auto',
              maxTokens: settings.maxTokens || 4000,
              temperature: settings.temperature || 0.7,
            });
          } else {
            resolve(null);
          }
        });
      } else {
        console.warn('Chrome storage API not available');
        resolve(null);
      }
    });
  }

  // Check if API is configured
  static async isConfigured(): Promise<boolean> {
    const settings = await this.getApiSettings();
    return settings ? settings.apiKey.length > 0 : false;
  }
}

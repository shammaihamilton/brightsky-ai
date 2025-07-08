import type { IStorageService } from '../interfaces';
import { ExtensionContext } from '../../../utils/extensionContext';

interface StorageSettings {
  apiSettings?: unknown;
  chatSettings?: unknown;
}

export class StorageService implements IStorageService {
  private cleanupStorageListener?: () => void;
  private onSettingsChange?: (settings: StorageSettings) => void;

  constructor(onSettingsChange?: (settings: StorageSettings) => void) {
    this.onSettingsChange = onSettingsChange;
  }

  async loadSettings(): Promise<void> {
    await ExtensionContext.safeCall(async () => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.get(["apiSettings", "chatSettings"], (result) => {
          if (chrome.runtime.lastError) {
            console.error("Chrome storage error:", chrome.runtime.lastError);
            return;
          }

          if (this.onSettingsChange) {
            this.onSettingsChange(result);
          }
        });
      }
    });
  }

  watchStorageChanges(): () => void {
    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === 'sync') {
        const updatedSettings: StorageSettings = {};
        
        if (changes.chatSettings) {
          updatedSettings.chatSettings = changes.chatSettings.newValue;
        }
        
        if (changes.apiSettings) {
          updatedSettings.apiSettings = changes.apiSettings.newValue;
        }

        if (this.onSettingsChange && Object.keys(updatedSettings).length > 0) {
          this.onSettingsChange(updatedSettings);
        }
      }
    };

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      
      this.cleanupStorageListener = () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
      
      return this.cleanupStorageListener;
    }

    return () => {}; // No-op cleanup if chrome storage not available
  }

  dispose(): void {
    if (this.cleanupStorageListener) {
      this.cleanupStorageListener();
      this.cleanupStorageListener = undefined;
    }
  }
}

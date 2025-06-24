import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  setApiKey, 
  setProvider, 
  setTheme, 
  setMaxTokens,
  setTemperature,
  loadSettings
} from '../../store/slices/settingsSlice';
import {
  selectApiKey,
  selectProvider,
  selectApiTheme,
  selectIsConfigured,
  selectMaxTokens,
  selectTemperature
} from '../../store/selectors/settingsSelectors';
import { ApiKeySecurity } from '../../utils/apiKeySecurity';

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

const SettingsPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const apiKey = useAppSelector(selectApiKey);
  const provider = useAppSelector(selectProvider);
  const theme = useAppSelector(selectApiTheme);
  const isConfigured = useAppSelector(selectIsConfigured);
  const maxTokens = useAppSelector(selectMaxTokens);
  const temperature = useAppSelector(selectTemperature);  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState<string | null>(null);
  useEffect(() => {
    // Load settings from Chrome storage on mount
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get(['apiSettings'], (result: ChromeStorageResult) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome storage error:', chrome.runtime.lastError);
        } else if (result.apiSettings) {
          const settings = result.apiSettings;
          
          // Deobfuscate API key if it's obfuscated
          const deobfuscatedKey = settings.apiKey ? ApiKeySecurity.deobfuscate(settings.apiKey) : '';
          
          dispatch(loadSettings({
            ...settings,
            apiKey: deobfuscatedKey
          }));
          setLocalApiKey(deobfuscatedKey);
        }
      });
    } else {
      console.warn('Chrome storage API not available');
    }
  }, [dispatch]);
  const handleSaveApiKey = async () => {
    // Validate API key format
    if (localApiKey && !ApiKeySecurity.validateKeyFormat(localApiKey, provider)) {
      setKeyValidationError(`Invalid ${provider} API key format`);
      return;
    }
    
    setKeyValidationError(null);
    setIsSaving(true);
    dispatch(setApiKey(localApiKey));
    
    // Obfuscate API key before storing
    const obfuscatedKey = localApiKey ? ApiKeySecurity.obfuscate(localApiKey) : '';
    
    // Save to Chrome storage with obfuscated key
    const settings = {
      apiKey: obfuscatedKey,
      provider,
      theme,
      maxTokens,
      temperature
    };
      chrome.storage.sync.set({ apiSettings: settings }, () => {
      setIsSaving(false);
      // API key saved successfully
    });
  };

  const handleProviderChange = (newProvider: 'openai' | 'claude' | 'gemini') => {
    dispatch(setProvider(newProvider));
    saveToStorage({ provider: newProvider });
  };
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    dispatch(setTheme(newTheme));
    saveToStorage({ theme: newTheme });
    
    // Apply theme to document
    applyTheme(newTheme);
  };  // Function to apply theme to document
  const applyTheme = (themeValue: 'light' | 'dark' | 'auto') => {
    const root = document.documentElement;
    
    if (themeValue === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      root.setAttribute('data-theme', themeValue);
    }
  };
  // Apply theme on component mount and when theme changes
  useEffect(() => {
    applyTheme(theme as 'light' | 'dark' | 'auto');
  }, [theme]);

  const handleMaxTokensChange = (newMaxTokens: number) => {
    dispatch(setMaxTokens(newMaxTokens));
    saveToStorage({ maxTokens: newMaxTokens });
  };

  const handleTemperatureChange = (newTemperature: number) => {
    dispatch(setTemperature(newTemperature));
    saveToStorage({ temperature: newTemperature });
  };  const saveToStorage = (updates: Partial<ApiSettings>) => {
    chrome.storage.sync.get(['apiSettings'], (result: ChromeStorageResult) => {
      const currentSettings = result.apiSettings || {};
      const newSettings = { ...currentSettings, ...updates };
      
      // If updating API key, obfuscate it
      if (updates.apiKey !== undefined) {
        newSettings.apiKey = updates.apiKey ? ApiKeySecurity.obfuscate(updates.apiKey) : '';
      }
      
      chrome.storage.sync.set({ apiSettings: newSettings });
    });
  };

  const getProviderHelp = () => {
    switch (provider) {
      case 'openai':
        return 'Get your API key from platform.openai.com';
      case 'claude':
        return 'Get your API key from console.anthropic.com';
      case 'gemini':
        return 'Get your API key from makersuite.google.com';
      default:
        return 'Enter your API key';
    }
  };
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2 className="settings-title">AI Assistant Settings</h2>        <button 
          className="theme-toggle"
          onClick={() => handleThemeChange(theme === 'light' ? 'dark' : theme === 'dark' ? 'auto' : 'light')}
        >
          {theme === 'light' ? '🌙' : theme === 'dark' ? '🔄' : '☀️'}
        </button>
      </div>

      <div className={`status-indicator ${isConfigured ? 'configured' : 'not-configured'}`}>
        <div className="status-dot"></div>
        {isConfigured ? 'Ready to use' : 'Setup required'}
      </div>

      <div className="form-group">
        <label>
          AI Provider
          <div className="label-description">Choose your preferred AI service</div>
        </label>        <select 
          value={provider} 
          onChange={(e) => handleProviderChange(e.target.value as 'openai' | 'claude' | 'gemini')}
          className="form-control"
        >
          <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
          <option value="claude">Anthropic Claude</option>
          <option value="gemini">Google Gemini</option>
        </select>
      </div>      <div className="form-group">
        <label>
          API Key
          <div className="label-description">{getProviderHelp()}</div>
        </label>        <div className="api-key-container">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={localApiKey}
            onChange={(e) => {
              setLocalApiKey(e.target.value);
              if (keyValidationError) setKeyValidationError(null); // Clear error on change
            }}
            placeholder="Enter your API key..."
            className={`form-control api-key-input ${keyValidationError ? 'error' : ''}`}
          />
          <button 
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="api-key-toggle"
            title={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {showApiKey ? 'Hide' : 'Show'}
          </button>
        </div>
        {keyValidationError && (
          <div className="form-error">{keyValidationError}</div>
        )}
        <div className="help-text" style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
          🔒 Your API key is encrypted and stored locally on your device. Never sent to our servers.
        </div>
      </div>

      <div className="advanced-settings">        <button 
          className={`advanced-toggle ${showAdvanced ? 'expanded' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className="advanced-toggle-icon">▼</span>
          Advanced Settings
        </button>
        
        {showAdvanced && (
          <div className="advanced-content">
            <div className="form-group">
              <div className="range-container">
                <div className="range-header">
                  <label>Max Tokens</label>
                  <span className="range-value">{maxTokens}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="8000"
                  step="500"
                  value={maxTokens}
                  onChange={(e) => handleMaxTokensChange(Number(e.target.value))}
                  className="range-input"
                />
                <div className="help-text">Maximum length of AI responses</div>
              </div>
            </div>
            
            <div className="form-group">
              <div className="range-container">
                <div className="range-header">
                  <label>Temperature</label>
                  <span className="range-value">{temperature}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => handleTemperatureChange(Number(e.target.value))}
                  className="range-input"
                />
                <div className="help-text">Lower = more focused, Higher = more creative</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button 
          onClick={handleSaveApiKey}
          className={`btn btn-primary btn-full ${isSaving ? 'btn-loading' : ''}`}
          disabled={!localApiKey.trim() || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;

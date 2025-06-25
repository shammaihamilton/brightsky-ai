import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  setApiKey,
  setProvider,
  setTheme,
  setMaxTokens,
  setTemperature,
  loadSettings,
} from "../../store/slices/settingsSlice";
import { updateChatSettings } from "../../store/slices/chatSettingsSlice";
import {
  selectApiKey,
  selectProvider,
  selectApiTheme,
  selectIsConfigured,
  selectMaxTokens,
  selectTemperature,
  selectChatSettingsState,
} from "../../store/selectors/settingsSelectors";
import { ApiKeySecurity } from "../../utils/apiKeySecurity";
import type { Tone, ButtonSize } from "../../types/chat.types";

interface ApiSettings {
  apiKey?: string;
  provider?: "openai" | "claude" | "gemini";
  theme?: "light" | "dark" | "auto";
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
  const temperature = useAppSelector(selectTemperature);
  const chatSettings = useAppSelector(selectChatSettingsState);

  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showChatSettings, setShowChatSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [keyValidationError, setKeyValidationError] = useState<string | null>(
    null
  );
  useEffect(() => {
    // Load settings from Chrome storage on mount
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.get(
        ["apiSettings"],
        (result: ChromeStorageResult) => {
          if (chrome.runtime.lastError) {
            console.error("Chrome storage error:", chrome.runtime.lastError);
          } else if (result.apiSettings) {
            const settings = result.apiSettings;

            // Deobfuscate API key if it's obfuscated
            const deobfuscatedKey = settings.apiKey
              ? ApiKeySecurity.deobfuscate(settings.apiKey)
              : "";

            dispatch(
              loadSettings({
                ...settings,
                apiKey: deobfuscatedKey,
              })
            );
            setLocalApiKey(deobfuscatedKey);
          }
        }
      );
    } else {
      console.warn("Chrome storage API not available");
    }
  }, [dispatch]);
  const handleSaveApiKey = async () => {
    // Validate API key format
    if (
      localApiKey &&
      !ApiKeySecurity.validateKeyFormat(localApiKey, provider)
    ) {
      setKeyValidationError(`Invalid ${provider} API key format`);
      return;
    }

    setKeyValidationError(null);
    setIsSaving(true);
    dispatch(setApiKey(localApiKey));

    // Obfuscate API key before storing
    const obfuscatedKey = localApiKey
      ? ApiKeySecurity.obfuscate(localApiKey)
      : "";

    // Save to Chrome storage with obfuscated key
    const settings = {
      apiKey: obfuscatedKey,
      provider,
      theme,
      maxTokens,
      temperature,
    };
    chrome.storage.sync.set({ apiSettings: settings }, () => {
      setIsSaving(false);
      // API key saved successfully
    });
  };

  const handleProviderChange = (
    newProvider: "openai" | "claude" | "gemini"
  ) => {
    dispatch(setProvider(newProvider));
    saveToStorage({ provider: newProvider });
  };
  const handleThemeChange = (newTheme: "light" | "dark" | "auto") => {
    dispatch(setTheme(newTheme));
    saveToStorage({ theme: newTheme });

    // Apply theme to document
    applyTheme(newTheme);
  }; // Function to apply theme to document
  const applyTheme = (themeValue: "light" | "dark" | "auto") => {
    const root = document.documentElement;

    if (themeValue === "auto") {
      // Use system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", themeValue);
    }
  };
  // Apply theme on component mount and when theme changes
  useEffect(() => {
    applyTheme(theme as "light" | "dark" | "auto");
  }, [theme]);

  const handleMaxTokensChange = (newMaxTokens: number) => {
    dispatch(setMaxTokens(newMaxTokens));
    saveToStorage({ maxTokens: newMaxTokens });
  };
  const handleTemperatureChange = (newTemperature: number) => {
    dispatch(setTemperature(newTemperature));
    saveToStorage({ temperature: newTemperature });
  };
  // Chat settings handlers
  const handleChatSettingsChange = (updates: Partial<typeof chatSettings>) => {
    dispatch(updateChatSettings(updates));
  };

  const handleAssistantNameChange = (name: string) => {
    handleChatSettingsChange({ assistantName: name });
  };
  const handleToneChange = (tone: string) => {
    handleChatSettingsChange({ tone: tone as Tone });
  };

  const handleButtonSizeChange = (buttonSize: string) => {
    handleChatSettingsChange({ buttonSize: buttonSize as ButtonSize });
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    if (chatSettings.notifications) {
      handleChatSettingsChange({
        notifications: {
          ...chatSettings.notifications,
          [key]: value,
        },
      });
    }
  };
  const saveToStorage = (updates: Partial<ApiSettings>) => {
    chrome.storage.sync.get(["apiSettings"], (result: ChromeStorageResult) => {
      const currentSettings = result.apiSettings || {};
      const newSettings = { ...currentSettings, ...updates };

      // If updating API key, obfuscate it
      if (updates.apiKey !== undefined) {
        newSettings.apiKey = updates.apiKey
          ? ApiKeySecurity.obfuscate(updates.apiKey)
          : "";
      }

      chrome.storage.sync.set({ apiSettings: newSettings });
    });
  };

  const getProviderHelp = () => {
    switch (provider) {
      case "openai":
        return "Get your API key from platform.openai.com";
      case "claude":
        return "Get your API key from console.anthropic.com";
      case "gemini":
        return "Get your API key from makersuite.google.com";
      default:
        return "Enter your API key";
    }
  };
  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h2 className="settings-title">AI Assistant Settings</h2>{" "}
        <button
          className="theme-toggle"
          onClick={() =>
            handleThemeChange(
              theme === "light" ? "dark" : theme === "dark" ? "auto" : "light"
            )
          }
        >
          {theme === "light" ? "🌙" : theme === "dark" ? "🔄" : "☀️"}
        </button>
      </div>
      <div
        className={`status-indicator ${
          isConfigured ? "configured" : "not-configured"
        }`}
      >
        <div className="status-dot"></div>
        {isConfigured ? "Ready to use" : "Setup required"}
      </div>
      <div className="form-group">
        <label>
          AI Provider
          <div className="label-description">
            Choose your preferred AI service
          </div>
        </label>{" "}
        <select
          value={provider}
          onChange={(e) =>
            handleProviderChange(
              e.target.value as "openai" | "claude" | "gemini"
            )
          }
          className="form-control"
        >
          <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
          <option value="claude">Anthropic Claude</option>
          <option value="gemini">Google Gemini</option>
        </select>
      </div>{" "}
      <div className="form-group">
        <label>
          API Key
          <div className="label-description">{getProviderHelp()}</div>
        </label>{" "}
        <div className="api-key-container">
          <input
            type={showApiKey ? "text" : "password"}
            value={localApiKey}
            onChange={(e) => {
              setLocalApiKey(e.target.value);
              if (keyValidationError) setKeyValidationError(null); // Clear error on change
            }}
            placeholder="Enter your API key..."
            className={`form-control api-key-input ${
              keyValidationError ? "error" : ""
            }`}
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="api-key-toggle"
            title={showApiKey ? "Hide API key" : "Show API key"}
          >
            {showApiKey ? "Hide" : "Show"}
          </button>
        </div>
        {keyValidationError && (
          <div className="form-error">{keyValidationError}</div>
        )}
        <div
          className="help-text"
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            marginTop: "4px",
          }}
        >
          🔒 Your API key is encrypted and stored locally on your device. Never
          sent to our servers.
        </div>
      </div>
      <div className="advanced-settings">
        {" "}
        <button
          className={`advanced-toggle ${showAdvanced ? "expanded" : ""}`}
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
                  onChange={(e) =>
                    handleMaxTokensChange(Number(e.target.value))
                  }
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
                  onChange={(e) =>
                    handleTemperatureChange(Number(e.target.value))
                  }
                  className="range-input"
                />
                <div className="help-text">
                  Lower = more focused, Higher = more creative
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Chat Settings Section */}
      <div className="chat-settings">
        <button
          className={`advanced-toggle ${showChatSettings ? "expanded" : ""}`}
          onClick={() => setShowChatSettings(!showChatSettings)}
        >
          <span className="advanced-toggle-icon">▼</span>
          Chat Settings
        </button>

        {showChatSettings && (
          <div className="advanced-content">
            {/* Assistant Name */}
            <div className="form-group">
              <label>Assistant Name</label>
              <input
                type="text"
                value={chatSettings.assistantName}
                onChange={(e) => handleAssistantNameChange(e.target.value)}
                placeholder="BrightSky"
                maxLength={20}
              />
              <div className="help-text">Name displayed for AI responses</div>
            </div>

            {/* Conversation Tone */}
            <div className="form-group">
              <label>Conversation Tone</label>
              <select
                value={chatSettings.tone}
                onChange={(e) => handleToneChange(e.target.value)}
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Casual">Casual</option>
                <option value="Creative">Creative</option>
                <option value="Analytical">Analytical</option>
              </select>
              <div className="help-text">AI personality and response style</div>
            </div>

            {/* Widget Size */}
            <div className="form-group">
              <label>Widget Button Size</label>
              <select
                value={chatSettings.buttonSize}
                onChange={(e) => handleButtonSizeChange(e.target.value)}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              <div className="help-text">Size of the floating chat button</div>
            </div>

            {/* Notifications */}
            <div className="form-group">
              <label>Notifications</label>
              <div className="checkbox-group">
                {" "}
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={chatSettings.notifications?.soundEnabled || false}
                    onChange={(e) =>
                      handleNotificationChange("soundEnabled", e.target.checked)
                    }
                  />
                  <span>Sound notifications</span>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={
                      chatSettings.notifications?.desktopNotifications || false
                    }
                    onChange={(e) =>
                      handleNotificationChange(
                        "desktopNotifications",
                        e.target.checked
                      )
                    }
                  />
                  <span>Desktop notifications</span>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={chatSettings.notifications?.emailSummary || false}
                    onChange={(e) =>
                      handleNotificationChange("emailSummary", e.target.checked)
                    }
                  />
                  <span>Email summary (when available)</span>
                </label>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="form-group">
              <label>Privacy</label>
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={chatSettings.privacy.saveHistory}
                    onChange={(e) =>
                      handleChatSettingsChange({
                        privacy: {
                          ...chatSettings.privacy,
                          saveHistory: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>Save conversation history</span>
                </label>
                <div className="form-group" style={{ marginLeft: "20px" }}>
                  <label>Auto-clear after (days)</label>
                  <select
                    value={chatSettings.privacy.autoClearDays}
                    onChange={(e) =>
                      handleChatSettingsChange({
                        privacy: {
                          ...chatSettings.privacy,
                          autoClearDays: Number(e.target.value),
                        },
                      })
                    }
                    disabled={!chatSettings.privacy.saveHistory}
                  >
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="365">1 year</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Accessibility */}
            <div className="form-group">
              <label>Accessibility</label>
              <div className="checkbox-group">
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={chatSettings.accessibility.highContrast}
                    onChange={(e) =>
                      handleChatSettingsChange({
                        accessibility: {
                          ...chatSettings.accessibility,
                          highContrast: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>High contrast mode</span>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={chatSettings.accessibility.reducedMotion}
                    onChange={(e) =>
                      handleChatSettingsChange({
                        accessibility: {
                          ...chatSettings.accessibility,
                          reducedMotion: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>Reduced animations</span>
                </label>
                <label className="checkbox-item">
                  <input
                    type="checkbox"
                    checked={chatSettings.accessibility.screenReaderOptimized}
                    onChange={(e) =>
                      handleChatSettingsChange({
                        accessibility: {
                          ...chatSettings.accessibility,
                          screenReaderOptimized: e.target.checked,
                        },
                      })
                    }
                  />
                  <span>Screen reader optimized</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="action-buttons">
        <button
          onClick={handleSaveApiKey}
          className={`btn btn-primary btn-full ${
            isSaving ? "btn-loading" : ""
          }`}
          disabled={!localApiKey.trim() || isSaving}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;

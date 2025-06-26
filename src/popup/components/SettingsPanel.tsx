import React from 'react';
import { useApiSettings } from '../hooks/useApiSettings';
import { useChatSettings } from '../hooks/useChatSettings';
import { PopupHeader } from './PopupHeader';
import { ApiConfigSection } from './sections/ApiConfigSection';
import { AdvancedSettingsSection } from './sections/AdvancedSettingsSection';
import { ChatSettingsSection } from './sections/ChatSettingsSection';

export const SettingsPanel: React.FC = () => {
  const apiSettings = useApiSettings();
  const chatSettings = useChatSettings();

  // Combine settings saved state from both hooks
  const isSettingsSaved = apiSettings.isSaving || chatSettings.isSettingsSaved;

  const handleThemeToggle = () => {
    const nextTheme = apiSettings.apiSettings.theme === 'light' ? 'dark' : 
                     apiSettings.apiSettings.theme === 'dark' ? 'auto' : 'light';
    apiSettings.actions.handleThemeChange(nextTheme);
  };

  return (
    <div className="settings-panel">
      <PopupHeader
        isConfigured={apiSettings.apiSettings.isConfigured}
        theme={apiSettings.apiSettings.theme}
        onThemeToggle={handleThemeToggle}
      />

      <ApiConfigSection
        apiSettings={apiSettings.apiSettings}
        localApiKey={apiSettings.localApiKey}
        showApiKey={apiSettings.showApiKey}
        keyValidationError={apiSettings.keyValidationError}
        isSaving={apiSettings.isSaving}
        actions={apiSettings.actions}
        utils={apiSettings.utils}
      />

      <AdvancedSettingsSection
        apiSettings={apiSettings.apiSettings}
        showAdvanced={apiSettings.showAdvanced}
        actions={apiSettings.actions}
      />

      <ChatSettingsSection
        chatSettings={chatSettings.chatSettings}
        showChatSettings={chatSettings.showChatSettings}
        actions={chatSettings.actions}
      />

      {/* Settings Saved Toast */}
      {isSettingsSaved && (
        <div className="settings-toast">
          <span className="toast-icon">✓ </span>
          Settings saved successfully!
        </div>
      )}

      <div className="action-buttons">
        <button
          onClick={apiSettings.actions.handleSaveApiKey}
          className={`btn btn-primary btn-full ${apiSettings.isSaving ? 'btn-loading' : ''} ${isSettingsSaved ? 'btn-success' : ''}`}
          disabled={!apiSettings.localApiKey.trim() || apiSettings.isSaving}
          type="button"
        >
          {apiSettings.isSaving ? 'Saving...' : isSettingsSaved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

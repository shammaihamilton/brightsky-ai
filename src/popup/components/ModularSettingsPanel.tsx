import React from 'react';
import { useSettingsManager } from '../hooks/useSettingsManager';
import { PopupHeader } from './PopupHeader';
import { ApiConfigSection } from './sections/ApiConfigSection';
import { AdvancedSettingsSection } from './sections/AdvancedSettingsSection';
import { ChatSettingsSection } from './sections/ChatSettingsSection';

export const ModularSettingsPanel: React.FC = () => {
  const {
    apiSettings,
    chatSettings,
    localApiKey,
    showApiKey,
    showAdvanced,
    showChatSettings,
    isSaving,
    isSettingsSaved,
    keyValidationError,
    actions,
    utils,
  } = useSettingsManager();

  const handleThemeToggle = () => {
    const nextTheme = apiSettings.theme === 'light' ? 'dark' : 
                     apiSettings.theme === 'dark' ? 'auto' : 'light';
    actions.handleThemeChange(nextTheme);
  };

  return (
    <div className="settings-panel">
      <PopupHeader
        isConfigured={apiSettings.isConfigured}
        theme={apiSettings.theme}
        onThemeToggle={handleThemeToggle}
      />

      <ApiConfigSection
        apiSettings={apiSettings}
        localApiKey={localApiKey}
        showApiKey={showApiKey}
        keyValidationError={keyValidationError}
        isSaving={isSaving}
        actions={actions}
        utils={utils}
      />

      <AdvancedSettingsSection
        apiSettings={apiSettings}
        showAdvanced={showAdvanced}
        actions={actions}
      />

      <ChatSettingsSection
        chatSettings={chatSettings}
        showChatSettings={showChatSettings}
        actions={actions}
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
          onClick={actions.handleSaveApiKey}
          className={`btn btn-primary btn-full ${isSaving ? 'btn-loading' : ''} ${isSettingsSaved ? 'btn-success' : ''}`}
          disabled={!localApiKey.trim() || isSaving}
          type="button"
        >
          {isSaving ? 'Saving...' : isSettingsSaved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

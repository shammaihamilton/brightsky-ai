import React from 'react';
import { useSettingsManager } from '../hooks/useSettingsManager';
import { PopupHeader } from './PopupHeader';
import { ApiConfigSection } from './sections/ApiConfigSection';
import { AdvancedSettingsSection } from './sections/AdvancedSettingsSection';
import { ChatSettingsSection } from './sections/ChatSettingsSection';

/**
 * Modular Settings Panel - Refactored version of the original SettingsPanel
 * 
 * Key improvements:
 * - Separated concerns into individual section components
 * - Extracted business logic into custom hook
 * - Better TypeScript interfaces
 * - Easier to maintain and extend
 * - Testable components
 */
export const ModularSettingsPanel: React.FC = () => {
  const {
    apiSettings,
    chatSettings,
    localApiKey,
    showApiKey,
    showAdvanced,
    showChatSettings,
    isSaving,
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

      <div className="action-buttons">
        <button
          onClick={actions.handleSaveApiKey}
          className={`btn btn-primary btn-full ${isSaving ? 'btn-loading' : ''}`}
          disabled={!localApiKey.trim() || isSaving}
          type="button"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

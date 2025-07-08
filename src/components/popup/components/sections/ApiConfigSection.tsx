import React from 'react';
import type { UseApiSettingsReturn } from '../../hooks/useApiSettings';

interface ApiConfigSectionProps {
  apiSettings: UseApiSettingsReturn['apiSettings'];
  localApiKey: string;
  showApiKey: boolean;
  keyValidationError: string | null;
  isSaving: boolean;
  actions: UseApiSettingsReturn['actions'];
  utils: UseApiSettingsReturn['utils'];
}

export const ApiConfigSection: React.FC<ApiConfigSectionProps> = ({
  apiSettings,
  localApiKey,
  showApiKey,
  keyValidationError,
  // isSaving,
  actions,
  utils,
}) => {
  return (
    <div className="api-config-section">
      <div className="form-group">
        <label>
          AI Provider
          <div className="label-description">Choose your preferred AI service</div>
        </label>        <select
          value={apiSettings.provider}
          onChange={(e) => actions.handleProviderChange(e.target.value as 'openai' | 'claude' | 'gemini')}
          className="form-control"
        >
          <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
          <option value="claude">Anthropic Claude</option>
          <option value="gemini">Google Gemini</option>
        </select>
      </div>

      <div className="form-group">
        <label>
          API Key
          <div className="label-description">{utils.getProviderHelp()}</div>
        </label>
        <div className="api-key-container">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={localApiKey}
            onChange={(e) => actions.setLocalApiKey(e.target.value)}
            placeholder="Enter your API key..."
            className={`form-control api-key-input ${keyValidationError ? 'error' : ''}`}
          />
          <button
            type="button"
            onClick={actions.toggleApiKeyVisibility}
            className="api-key-toggle"
            title={showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {showApiKey ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {keyValidationError && (
          <div className="form-error">{keyValidationError}</div>
        )}
        
        <div className="help-text security-notice">
          🔒 Your API key is encrypted and stored locally on your device. Never sent to our servers.
        </div>
      </div>
    </div>
  );
};

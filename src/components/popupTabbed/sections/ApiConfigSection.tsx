import React from 'react';
import { useApiSettings } from '../hooks/useApiSettings';

export const ApiConfigSection: React.FC = () => {
  const apiSettings = useApiSettings();
  return (
    <div className="api-config-section">
      <div className="form-group">
        <label>
          AI Provider
          <div className="label-description">Choose your preferred AI service</div>
        </label>
        <select
          value={apiSettings.apiSettings.provider}
          onChange={(e) => apiSettings.actions.handleProviderChange(e.target.value as 'openai' | 'claude' | 'gemini')}
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
          <div className="label-description">{apiSettings.utils.getProviderHelp()}</div>
        </label>
        <div className="api-key-container">
          <input
            type={apiSettings.showApiKey ? 'text' : 'password'}
            value={apiSettings.localApiKey}
            onChange={(e) => apiSettings.actions.setLocalApiKey(e.target.value)}
            placeholder="Enter your API key..."
            className={`form-control api-key-input ${apiSettings.keyValidationError ? 'error' : ''}`}
          />
          <button
            type="button"
            onClick={apiSettings.actions.toggleApiKeyVisibility}
            className="api-key-toggle"
            title={apiSettings.showApiKey ? 'Hide API key' : 'Show API key'}
          >
            {apiSettings.showApiKey ? 'Hide' : 'Show'}
          </button>
        </div>
        {apiSettings.keyValidationError && (
          <div className="form-error">{apiSettings.keyValidationError}</div>
        )}
        <div className="help-text security-notice">
          🔒 Your API key is encrypted and stored locally on your device. Never sent to our servers.
        </div>
      </div>
    </div>
  );
}; 
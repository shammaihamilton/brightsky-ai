import React from 'react';
import { useApiSettings } from '../hooks/useApiSettings';

export const AdvancedSettingsSection: React.FC = () => {
  const apiSettings = useApiSettings();
  return (
    <div className="advanced-settings">
      <button
        className={`advanced-toggle ${apiSettings.showAdvanced ? 'expanded' : ''}`}
        onClick={apiSettings.actions.toggleAdvanced}
        type="button"
      >
        <span className="advanced-toggle-icon">▼</span>
        Advanced Settings
      </button>
      {apiSettings.showAdvanced && (
        <div className="advanced-content">
          <div className="form-group">
            <div className="range-container">
              <div className="range-header">
                <label>Max Tokens</label>
                <span className="range-value">{apiSettings.apiSettings.maxTokens}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={apiSettings.apiSettings.maxTokens}
                onChange={(e) => apiSettings.actions.handleMaxTokensChange(Number(e.target.value))}
                className="range-input"
              />
              <div className="help-text">Maximum length of AI responses</div>
            </div>
          </div>
          <div className="form-group">
            <div className="range-container">
              <div className="range-header">
                <label>Temperature</label>
                <span className="range-value">{apiSettings.apiSettings.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={apiSettings.apiSettings.temperature}
                onChange={(e) => apiSettings.actions.handleTemperatureChange(Number(e.target.value))}
                className="range-input"
              />
              <div className="help-text">Lower = more focused, Higher = more creative</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
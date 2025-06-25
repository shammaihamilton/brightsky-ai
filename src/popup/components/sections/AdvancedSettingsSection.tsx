import React from 'react';
import type { UseSettingsManagerReturn } from '../../hooks/useSettingsManager';

interface AdvancedSettingsSectionProps {
  apiSettings: UseSettingsManagerReturn['apiSettings'];
  showAdvanced: boolean;
  actions: UseSettingsManagerReturn['actions'];
}

export const AdvancedSettingsSection: React.FC<AdvancedSettingsSectionProps> = ({
  apiSettings,
  showAdvanced,
  actions,
}) => {
  return (
    <div className="advanced-settings">
      <button
        className={`advanced-toggle ${showAdvanced ? 'expanded' : ''}`}
        onClick={actions.toggleAdvanced}
        type="button"
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
                <span className="range-value">{apiSettings.maxTokens}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="8000"
                step="500"
                value={apiSettings.maxTokens}
                onChange={(e) => actions.handleMaxTokensChange(Number(e.target.value))}
                className="range-input"
              />
              <div className="help-text">Maximum length of AI responses</div>
            </div>
          </div>

          <div className="form-group">
            <div className="range-container">
              <div className="range-header">
                <label>Temperature</label>
                <span className="range-value">{apiSettings.temperature}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={apiSettings.temperature}
                onChange={(e) => actions.handleTemperatureChange(Number(e.target.value))}
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

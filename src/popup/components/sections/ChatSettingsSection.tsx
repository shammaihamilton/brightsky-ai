import React from 'react';
import type { UseSettingsManagerReturn } from '../../hooks/useSettingsManager';

interface ChatSettingsSectionProps {
  chatSettings: UseSettingsManagerReturn['chatSettings'];
  showChatSettings: boolean;
  actions: UseSettingsManagerReturn['actions'];
}

export const ChatSettingsSection: React.FC<ChatSettingsSectionProps> = ({
  chatSettings,
  showChatSettings,
  actions,
}) => {
  return (
    <div className="chat-settings">
      <button
        className={`advanced-toggle ${showChatSettings ? 'expanded' : ''}`}
        onClick={actions.toggleChatSettings}
        type="button"
      >
        <span className="advanced-toggle-icon">▼</span>
        Chat Settings
      </button>

      {showChatSettings && (
        <div className="advanced-content">
          {/* Assistant Settings */}
          <div className="settings-subsection">
            <h4>🤖 Assistant</h4>
            
            <div className="form-group">
              <label>Assistant Name</label>
              <input
                type="text"
                value={chatSettings.assistantName}
                onChange={(e) => actions.handleAssistantNameChange(e.target.value)}
                placeholder="BrightSky"
                maxLength={20}
                className="form-control"
              />
              <div className="help-text">Name displayed for AI responses</div>
            </div>

            <div className="form-group">
              <label>Conversation Tone</label>
              <select
                value={chatSettings.tone}
                onChange={(e) => actions.handleToneChange(e.target.value)}
                className="form-control"
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Casual">Casual</option>
                <option value="Creative">Creative</option>
                <option value="Analytical">Analytical</option>
              </select>
              <div className="help-text">AI personality and response style</div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="settings-subsection">
            <h4>🎨 Appearance</h4>
            
            <div className="form-group">
              <label>Widget Button Size</label>
              <select
                value={chatSettings.buttonSize}
                onChange={(e) => actions.handleButtonSizeChange(e.target.value)}
                className="form-control"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              <div className="help-text">Size of the floating chat button</div>
            </div>
          </div>

          {/* Notifications */}
          <div className="settings-subsection">
            <h4>🔔 Notifications</h4>
            
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={chatSettings.notifications?.soundEnabled || false}
                  onChange={(e) => actions.handleNotificationChange('soundEnabled', e.target.checked)}
                />
                <span>Sound notifications</span>
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={chatSettings.notifications?.desktopNotifications || false}
                  onChange={(e) => actions.handleNotificationChange('desktopNotifications', e.target.checked)}
                />
                <span>Desktop notifications</span>
              </label>
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={chatSettings.notifications?.emailSummary || false}
                  onChange={(e) => actions.handleNotificationChange('emailSummary', e.target.checked)}
                />
                <span>Email summary (when available)</span>
              </label>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="settings-subsection">
            <h4>🔒 Privacy</h4>
            
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={chatSettings.privacy.saveHistory}
                  onChange={(e) =>
                    actions.handleChatSettingsChange({
                      privacy: {
                        ...chatSettings.privacy,
                        saveHistory: e.target.checked,
                      },
                    })
                  }
                />
                <span>Save conversation history</span>
              </label>
              
              {chatSettings.privacy.saveHistory && (
                <div className="form-group nested-setting">
                  <label>Auto-clear after (days)</label>
                  <select
                    value={chatSettings.privacy.autoClearDays}
                    onChange={(e) =>
                      actions.handleChatSettingsChange({
                        privacy: {
                          ...chatSettings.privacy,
                          autoClearDays: Number(e.target.value),
                        },
                      })
                    }
                    className="form-control"
                  >
                    <option value={7}>7 days</option>
                    <option value={30}>30 days</option>
                    <option value={90}>90 days</option>
                    <option value={365}>1 year</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Accessibility */}
          <div className="settings-subsection">
            <h4>♿ Accessibility</h4>
            
            <div className="checkbox-group">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  checked={chatSettings.accessibility.highContrast}
                  onChange={(e) =>
                    actions.handleChatSettingsChange({
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
                    actions.handleChatSettingsChange({
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
                    actions.handleChatSettingsChange({
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
  );
};

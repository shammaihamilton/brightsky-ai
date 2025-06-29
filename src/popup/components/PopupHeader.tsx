import React from "react";

interface PopupHeaderProps {
  isConfigured: boolean;
  theme: "light" | "dark" | "auto";
  onThemeToggle: () => void;
}

export const PopupHeader: React.FC<PopupHeaderProps> = ({
  isConfigured,
  theme,
  onThemeToggle,
}) => {
  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return "🌙";
      case "dark":
        return "🔄";
      case "auto":
        return "☀️";
      default:
        return "🔄";
    }
  };

  const getNextTheme = () => {
    switch (theme) {
      case "light":
        return "dark";
      case "dark":
        return "auto";
      case "auto":
        return "light";
      default:
        return "light";
    }
  };
  return (
    <div className="settings-header">
      <div className="header-left">
        <h2 className="settings-title">AI Assistant Settings</h2>
        <div
          className={`status-indicator ${
            isConfigured ? "configured" : "not-configured"
          }`}
        >
          <div className="status-dot"></div>
          {isConfigured ? "Ready to use" : "Setup required"}
        </div>
      </div>
      <div className="toolbar-row">
        <button
          className="theme-toggle"
          onClick={onThemeToggle}
          title={`Switch to ${getNextTheme()} theme`}
          type="button"
        >
          {getThemeIcon()}
        </button>
        <button
          className="toolbar-button"
          onClick={() => window.open("https://google.com", "_blank")}
          title="Open settings page"
          type="button"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
};

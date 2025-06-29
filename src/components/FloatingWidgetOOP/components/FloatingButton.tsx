import React from 'react';
import type { ButtonSize } from '../../../types/chat.types';
import styles from '../styles/FloatingButton.module.css';

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
}

interface FloatingButtonProps {
  position: { x: number; y: number };
  isDragging: boolean;
  isHovered: boolean;
  isPanelOpen: boolean;
  showMenu: boolean;
  buttonSize?: ButtonSize;
  accessibilitySettings?: AccessibilitySettings;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onMenuClick: (e: React.MouseEvent) => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  position,
  isDragging,
  isHovered,
  isPanelOpen,
  showMenu,
  buttonSize = 'medium',
  accessibilitySettings = { 
    highContrast: false, 
    reducedMotion: false, 
    screenReaderOptimized: false 
  },
  onMouseDown,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMenuClick,
}) => {
  // Helper function to get size values 
  const getSizeValues = (size: ButtonSize = 'medium') => {
    const sizeMap = {
      small: { size: 44, iconSize: 18 },
      medium: { size: 56, iconSize: 24 },
      large: { size: 68, iconSize: 28 }
    };
    return sizeMap[size];
  };

  const sizeValues = getSizeValues(buttonSize);

  // Button styling logic
  const getButtonStyling = () => {
    const baseGradient = 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)';
    const baseShadow = '0 4px 20px rgba(59, 130, 246, 0.3)';
    const hoverShadow = '0 8px 30px rgba(59, 130, 246, 0.4)';

    return {
      background: baseGradient,
      shadow: isHovered ? hoverShadow : baseShadow
    };
  };

  const buttonStyling = getButtonStyling();

  // CSS Custom Properties 
  const customProperties = {
    // Position
    '--button-x': `${position.x}px`,
    '--button-y': `${position.y}px`,
    
    // Size  
    '--button-size': `${sizeValues.size}px`,
    '--icon-size': `${sizeValues.iconSize}px`,
    
    // State-based styling
    '--cursor-type': isDragging ? 'grabbing' : 'pointer',
    '--container-cursor': isDragging ? 'grabbing' : 'auto',
    '--user-select': isDragging ? 'none' : 'auto',
    '--transform-scale': isDragging ? 'scale(1.05)' : 
                        isHovered ? 'scale(1.1)' : 'scale(1)',
    '--transition-type': isDragging ? 'none' : 'all 0.2s ease',
    
    // Background and shadow
    '--button-background': isPanelOpen ? '#4b5563' : buttonStyling.background,
    '--button-shadow': buttonStyling.shadow,
    
    // Pulse animation
    '--pulse-animation': (isDragging || accessibilitySettings.reducedMotion) ? 'none' : 'pulse 2s infinite',
    
    // Menu button
    '--menu-background': 'rgba(255, 255, 255, 0.95)',
    '--menu-opacity': isDragging ? '0' : '1',
    '--menu-scale': isDragging ? 'scale(0.8)' : 'scale(1)',
    '--menu-events': isDragging ? 'none' : 'auto',
  } as React.CSSProperties;

  return (
    <div className={styles.buttonContainer} style={customProperties}>
      {/* Main Button */}
      <button
        className={styles.floatingButton}
        onMouseDown={onMouseDown}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="button"
        tabIndex={0}
        aria-label="Open AI Assistant"
        type="button"
      >
        {/* Pulse Ring */}
        {!isDragging && !accessibilitySettings.reducedMotion && (
          <div className={styles.pulseRing} />
        )}
        {/* Chat Icon */}
        <div className={styles.chatIcon}>
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
      </button>

      {/* Menu Button */}
      <button
        className={styles.menuButton}
        onClick={onMenuClick}
        role="button"
        tabIndex={0}
        aria-label={showMenu ? "Close menu" : "Open menu"}
        type="button"
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
          />
        </svg>
      </button>
    </div>
  );
};

export default FloatingButton;

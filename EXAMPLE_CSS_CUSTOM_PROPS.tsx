// FloatingButton.tsx with CSS Custom Properties
import React from 'react';
import styles from './FloatingButton.module.scss';

interface FloatingButtonProps {
  position: { x: number; y: number };
  isDragging: boolean;
  isHovered: boolean;
  isPanelOpen: boolean;
  showMenu: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
  buttonSize: 'small' | 'medium' | 'large';
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
  connectionStatus,
  buttonSize,
  onMouseDown,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMenuClick,
}) => {
  // Size mapping
  const sizeValues = {
    small: { size: 44, iconSize: 18 },
    medium: { size: 56, iconSize: 24 },
    large: { size: 68, iconSize: 28 }
  }[buttonSize];

  // Connection status colors
  const connectionColors = {
    connected: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      shadow: '0 4px 20px rgba(59, 130, 246, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    disconnected: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      shadow: '0 4px 20px rgba(239, 68, 68, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    connecting: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      shadow: '0 4px 20px rgba(245, 158, 11, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    error: {
      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      shadow: '0 4px 20px rgba(220, 38, 38, 0.4), 0 1px 3px rgba(0, 0, 0, 0.1)'
    }
  }[connectionStatus];

  // Dynamic CSS custom properties
  const customProperties = {
    // Position
    '--button-x': `${position.x}px`,
    '--button-y': `${position.y}px`,
    
    // Size
    '--button-size': `${sizeValues.size}px`,
    '--icon-size': `${sizeValues.iconSize}px`,
    
    // State-based styling
    '--cursor-type': isDragging ? 'grabbing' : 'pointer',
    '--transform-scale': isDragging ? 'scale(1.05)' : 
                        isHovered ? 'scale(1.1)' : 'scale(1)',
    '--transition-type': isDragging ? 'none' : 'all 0.2s ease',
    
    // Connection status
    '--button-background': isPanelOpen ? '#4b5563' : connectionColors.background,
    '--button-shadow': isHovered ? 
      connectionColors.shadow.replace('0.3', '0.4') : 
      connectionColors.shadow,
    
    // Pulse animation
    '--pulse-opacity': isDragging ? '0' : '1',
    
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
        aria-label="Open AI Assistant"
      >
        {/* Pulse Ring */}
        <div className={styles.pulseRing} />

        {/* Chat Icon */}
        <div className={styles.chatIcon}>
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
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
        aria-label={showMenu ? "Close menu" : "Open menu"}
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

import React from 'react';
import type { ButtonSize } from '../../../types/chat.types';
import {
  ButtonContainer,
  FloatingButton as StyledButton,
  PulseRing,
  ChatIcon,
  MenuButton,
} from '../styled-components';

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
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
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
  buttonSize = 'medium', // Default to medium
  accessibilitySettings = { highContrast: false, reducedMotion: false, screenReaderOptimized: false },
  onMouseDown,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMenuClick,
}) => {  return (
    <ButtonContainer 
      position={position} 
      isDragging={isDragging} 
      buttonSize={buttonSize}
      accessibilitySettings={accessibilitySettings}
    >
      {/* Beautiful Widget Button with gradient */}
      <StyledButton
        onMouseDown={onMouseDown}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="button"
        tabIndex={0}
        aria-label="Open AI Assistant"
        isHovered={isHovered}
        isDragging={isDragging}
        isPanelOpen={isPanelOpen}
        buttonSize={buttonSize}
        accessibilitySettings={accessibilitySettings}
      >
        {/* Pulse animation ring */}
        {!isDragging && !accessibilitySettings.reducedMotion && (
          <PulseRing isDragging={isDragging} />
        )}{/* Chat Icon - Three dots in speech bubble */}
        <ChatIcon buttonSize={buttonSize}>
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
        </ChatIcon>
      </StyledButton>      {/* Menu Button (always visible, small gray circle) */}
      <MenuButton
        onClick={onMenuClick}
        isVisible={!isDragging}
        role="button"
        tabIndex={0}
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
      </MenuButton>
    </ButtonContainer>
  );
};

export default FloatingButton;

import styled, { css } from 'styled-components';
import { pulse, wiggle } from '../styles/animations';
import { colors, shadows, borderRadius, zIndex, typography } from '../styles/theme';

interface ButtonContainerProps {
  position: { x: number; y: number };
  isDragging: boolean;
}

export const ButtonContainer = styled.div<ButtonContainerProps>`
  position: fixed;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  width: 64px;
  height: 64px;
  z-index: ${zIndex.widget};
  pointer-events: auto;
  font-family: ${typography.fontFamily.system};
  
  ${props => props.isDragging && css`
    cursor: grabbing;
    user-select: none;
  `}
`;

interface FloatingButtonProps {
  isHovered: boolean;
  isDragging: boolean;
  isPanelOpen: boolean;
}

export const FloatingButton = styled.button<FloatingButtonProps>`
  position: relative;
  width: 64px;
  height: 64px;
  background: ${colors.primary.gradient};
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: ${borderRadius.full};
  cursor: ${props => props.isDragging ? 'grabbing' : 'pointer'};
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => props.isHovered ? shadows.buttonHover : shadows.button};
  transform: ${props => 
    props.isDragging ? 'scale(1.05)' : 
    props.isHovered ? 'scale(1.1)' : 
    'scale(1)'
  };
  transition: ${props => props.isDragging ? 'none' : 'all 0.2s ease'};
  opacity: 1;
  visibility: visible;
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus {
    outline: 2px solid ${colors.primary.blue};
    outline-offset: 2px;
  }
  
  ${props => props.isPanelOpen && css`
    background: ${colors.neutral.gray600};
  `}
`;

interface PulseRingProps {
  isDragging: boolean;
}

export const PulseRing = styled.div<PulseRingProps>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${borderRadius.full};
  background: rgba(59, 130, 246, 0.4);
  animation: ${props => props.isDragging ? 'none' : css`${pulse} 2s infinite`};
  pointer-events: none;
`;

export const ChatIcon = styled.div`
  width: 24px;
  height: 24px;
  color: ${colors.neutral.white};
  fill: none;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface MenuButtonProps {
  isVisible: boolean;
}

export const MenuButton = styled.button<MenuButtonProps>`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: ${borderRadius.full};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: ${props => props.isVisible ? 'scale(1)' : 'scale(0.8)'};
  pointer-events: ${props => props.isVisible ? 'auto' : 'none'};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${colors.neutral.white};
    transform: scale(1.1);
    animation: ${wiggle} 0.8s ease-in-out;
  }
  
  &:active {
    transform: scale(0.9);
  }
  
  svg {
    width: 12px;
    height: 12px;
    color: ${colors.neutral.gray600};
  }
`;

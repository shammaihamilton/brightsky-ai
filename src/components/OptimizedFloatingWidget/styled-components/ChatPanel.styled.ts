import styled from 'styled-components';
import { fadeIn } from '../styles/animations';
import { colors, shadows, spacing, borderRadius, zIndex, typography } from '../styles/theme';

interface ChatPanelContainerProps {
  position: { x: number; y: number };
}

export const ChatPanelContainer = styled.div<ChatPanelContainerProps>`
  position: fixed;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  width: 380px;
  height: 500px;
  z-index: ${zIndex.panel};
  pointer-events: auto;
  font-family: ${typography.fontFamily.system};
  animation: ${fadeIn} 0.3s ease-out;
`;

export const PanelContent = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${colors.neutral.white};
  border-radius: ${borderRadius.xl};
  box-shadow: ${shadows['2xl']};
  border: 1px solid ${colors.neutral.gray200};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

interface ConnectionStatusProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
}

export const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md} ${spacing.lg};
  background: ${colors.primary.gradient};
  color: ${colors.neutral.white};
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

export const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
`;

export const HeaderTitle = styled.h3`
  font-weight: ${typography.fontWeight.semibold};
  font-size: ${typography.fontSize.sm};
  margin: 0;
`;

export const PulseIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: ${borderRadius.full};
  background-color: ${colors.neutral.white};
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export const ConnectionStatus = styled.div<ConnectionStatusProps>`
  width: 8px;
  height: 8px;
  border-radius: ${borderRadius.full};
  background-color: ${props => {
    switch (props.status) {
      case 'connected':
        return colors.connection.connected;
      case 'connecting':
        return colors.connection.connecting;
      case 'disconnected':
        return colors.connection.disconnected;
      case 'error':
        return colors.connection.error;
      default:
        return colors.neutral.gray400;
    }
  }};
`;

export const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: ${borderRadius.full};
  padding: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.neutral.white};
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.3);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const MessagesContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

export const InputContainer = styled.div`
  border-top: 1px solid ${colors.neutral.gray200};
`;

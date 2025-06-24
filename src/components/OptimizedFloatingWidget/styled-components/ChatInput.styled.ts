import styled, { css } from 'styled-components';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

export const ChatInputContainer = styled.div`
  padding: ${spacing.md};
  background-color: ${colors.neutral.white};
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  background-color: ${colors.neutral.gray50};
  border: 1px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  box-shadow: ${shadows.sm};
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${colors.neutral.gray300};
    box-shadow: ${shadows.md};
  }
  
  &:focus-within {
    border-color: ${colors.primary.blue};
    box-shadow: ${shadows.lg};
  };
  border-radius: ${borderRadius.lg};
  padding: ${spacing.sm};
  transition: all 0.2s ease;
  box-shadow: none;
  
  &:focus-within {
    background-color: ${colors.neutral.gray100};
    box-shadow: 0 2px 8px rgba(66, 133, 244, 0.15);
  }
`;

export const TextAreaWrapper = styled.div`
  flex: 1;
  position: relative;
`;

interface StyledTextAreaProps {
  isDisabled: boolean;
}

export const StyledTextArea = styled.textarea<StyledTextAreaProps>`
  width: 100%;
  min-height: 20px;
  max-height: 60px;
  padding: 8px 0;
  border: none !important;
  background-color: transparent;
  color: ${colors.neutral.gray800};
  font-family: ${typography.fontFamily.system};
  font-size: ${typography.fontSize.sm};
  line-height: 1.4;
  resize: none;
  outline: none !important;
  box-shadow: none !important;
  transition: all 0.2s ease;
  
  &::placeholder {
    color: ${colors.neutral.gray400};
    transition: color 0.2s ease;
  }
  
  &:focus::placeholder {
    color: ${colors.neutral.gray300};
  }
  
  ${props => props.isDisabled && css`
    color: ${colors.neutral.gray400};
    cursor: not-allowed;
    
    &::placeholder {
      color: ${colors.neutral.gray300};
    }
  `}
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.neutral.gray300};
    border-radius: 2px;
    transition: background-color 0.2s ease;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.neutral.gray400};
  }
`;

interface SendButtonProps {
  isEnabled: boolean;
}

export const SendButton = styled.button<SendButtonProps>`
  min-width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: ${props => props.isEnabled 
    ? 'linear-gradient(135deg, #4285f4 0%, #1a73e8 100%)'
    : 'rgba(0, 0, 0, 0.1)'
  };
  color: ${props => props.isEnabled ? colors.neutral.white : colors.neutral.gray400};
  cursor: ${props => props.isEnabled ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;
  
  &:hover {
    ${props => props.isEnabled && css`
      background: linear-gradient(135deg, #3367d6 0%, #1557b0 100%);
      transform: scale(1.05);
      box-shadow: ${shadows.sm};
    `}
    ${props => !props.isEnabled && css`
      background: rgba(0, 0, 0, 0.15);
    `}
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:focus-visible {
    outline: 2px solid #4285f4;
    outline-offset: 2px;
  }
  
  svg {
    width: 16px;
    height: 16px;
    transition: transform 0.2s ease;
  }
  
  &:hover svg {
    ${props => props.isEnabled && css`
      transform: translateX(1px);
    `}
  }
`;

export const CharacterCount = styled.div<{ isOverLimit: boolean }>`
  position: absolute;
  bottom: 4px;
  right: 6px;
  font-size: ${typography.fontSize.xs};
  color: ${props => props.isOverLimit ? colors.semantic.error : colors.neutral.gray400};
  background-color: ${colors.neutral.white};
  padding: 1px 3px;
  border-radius: ${borderRadius.sm};
  font-size: 10px;
`;

export const ConnectionStatusIndicator = styled.div<{ status: string }>`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  margin-bottom: ${spacing.sm};
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral.gray500};
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
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
  }
`;

export const InputTypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.xs};
  margin-top: ${spacing.xs};
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral.gray500};
  
  &::after {
    content: '';
    width: 4px;
    height: 4px;
    border-radius: ${borderRadius.full};
    background-color: ${colors.primary.blue};
    margin-left: ${spacing.xs};
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 0.4;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
`;

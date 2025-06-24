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
  border: 2px solid ${colors.neutral.gray200};
  border-radius: 20px;
  padding: ${spacing.xs};
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: ${colors.primary.blue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  min-height: 32px;
  max-height: 80px;
  padding: ${spacing.sm};
  border: none;
  border-radius: 16px;
  background-color: transparent;
  color: ${colors.neutral.gray800};
  font-family: ${typography.fontFamily.system};
  font-size: ${typography.fontSize.sm};
  line-height: ${typography.lineHeight.normal};
  resize: none;
  outline: none;
  transition: all 0.2s ease;
  &::placeholder {
    color: ${colors.neutral.gray400};
  }
  
  ${props => props.isDisabled && css`
    color: ${colors.neutral.gray400};
    cursor: not-allowed;
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
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.neutral.gray400};
  }
`;

interface SendButtonProps {
  isEnabled: boolean;
}

export const SendButton = styled.button<SendButtonProps>`
  min-width: 36px;
  height: 36px;
  border: none;
  border-radius: 18px;
  background: ${props => props.isEnabled 
    ? 'transparent'
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  };
  color: ${props => props.isEnabled ? colors.neutral.gray500 : colors.neutral.white};
  cursor: ${props => props.isEnabled ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;  
  &:hover {
    ${props => props.isEnabled && css`
      color: ${colors.neutral.gray700};
      transform: scale(1.05);
    `}
    ${props => !props.isEnabled && css`
      background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
      transform: scale(1.05);
      box-shadow: ${shadows.sm};
    `}
  }
  
  &:active {
    ${props => props.isEnabled && css`
      transform: scale(0.95);
    `}
    ${props => !props.isEnabled && css`
      transform: scale(0.95);
    `}
  }
  
  svg {
    width: 14px;
    height: 14px;
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
    animation: pulse 1s infinite;
    margin-left: ${spacing.xs};
  }
`;

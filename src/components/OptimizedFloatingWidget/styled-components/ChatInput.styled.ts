import styled, { css } from 'styled-components';
import { colors, spacing, borderRadius, typography, shadows } from '../styles/theme';

export const ChatInputContainer = styled.div`
  padding: ${spacing.lg};
  background-color: ${colors.neutral.white};
`;

export const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${spacing.sm};
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
  min-height: 44px;
  max-height: 120px;
  padding: ${spacing.md};
  border: 2px solid ${colors.neutral.gray200};
  border-radius: ${borderRadius.lg};
  background-color: ${colors.neutral.white};
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
  
  &:focus {
    border-color: ${colors.primary.blue};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  ${props => props.isDisabled && css`
    background-color: ${colors.neutral.gray50};
    color: ${colors.neutral.gray400};
    cursor: not-allowed;
    border-color: ${colors.neutral.gray200};
    
    &:focus {
      border-color: ${colors.neutral.gray200};
      box-shadow: none;
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
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.neutral.gray400};
  }
`;

interface SendButtonProps {
  isEnabled: boolean;
}

export const SendButton = styled.button<SendButtonProps>`
  min-width: 44px;
  height: 44px;
  border: none;
  border-radius: ${borderRadius.lg};
  background-color: ${props => props.isEnabled ? colors.primary.blue : colors.neutral.gray300};
  color: ${colors.neutral.white};
  cursor: ${props => props.isEnabled ? 'pointer' : 'not-allowed'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    ${props => props.isEnabled && css`
      background-color: #2563eb;
      transform: translateY(-1px);
      box-shadow: ${shadows.md};
    `}
  }
  
  &:active {
    ${props => props.isEnabled && css`
      transform: translateY(0);
      box-shadow: ${shadows.sm};
    `}
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const CharacterCount = styled.div<{ isOverLimit: boolean }>`
  position: absolute;
  bottom: 6px;
  right: 8px;
  font-size: ${typography.fontSize.xs};
  color: ${props => props.isOverLimit ? colors.semantic.error : colors.neutral.gray400};
  background-color: ${colors.neutral.white};
  padding: 2px 4px;
  border-radius: ${borderRadius.sm};
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

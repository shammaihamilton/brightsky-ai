import styled, { css } from 'styled-components';
import { slideInFromRight } from '../styles/animations';
import { colors, shadows, spacing, borderRadius, typography } from '../styles/theme';

interface MessageContainerProps {
  sender: 'user' | 'ai' | 'system' | 'error';
}

export const MessageContainer = styled.div<MessageContainerProps>`
  display: flex;
  align-items: flex-start;
  gap: ${spacing.sm};
  animation: ${slideInFromRight} 0.3s ease-out;
  
  ${props => props.sender === 'user' && css`
    flex-direction: row-reverse;
  `}
`;

export const MessageBubble = styled.div<MessageContainerProps>`
  max-width: 80%;
  padding: ${spacing.md};
  border-radius: ${borderRadius.lg};
  font-size: ${typography.fontSize.sm};
  line-height: ${typography.lineHeight.normal};
  word-wrap: break-word;
  position: relative;
  
  ${props => {
    switch (props.sender) {
      case 'user':
        return css`
          background-color: ${colors.message.user.bg};
          color: ${colors.message.user.text};
          border-bottom-right-radius: ${spacing.xs};
        `;
      case 'ai':
        return css`
          background-color: ${colors.message.ai.bg};
          color: ${colors.message.ai.text};
          border-bottom-left-radius: ${spacing.xs};
          box-shadow: ${shadows.sm};
        `;      case 'system':
        return css`
          background-color: ${colors.message.system.bg};
          color: ${colors.message.system.text};
          border: 1px solid #f59e0b;
          font-size: ${typography.fontSize.xs};
        `;
      case 'error':
        return css`
          background-color: #fef2f2;
          color: ${colors.semantic.error};
          border: 1px solid ${colors.semantic.error};
          font-size: ${typography.fontSize.xs};
        `;
      default:
        return css`
          background-color: ${colors.neutral.gray100};
          color: ${colors.neutral.gray800};
        `;
    }
  }}
`;

export const MessageAvatar = styled.div<MessageContainerProps>`
  width: 32px;
  height: 32px;
  border-radius: ${borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  flex-shrink: 0;
  
  ${props => {
    switch (props.sender) {
      case 'user':
        return css`
          background-color: ${colors.primary.blue};
          color: ${colors.neutral.white};
        `;
      case 'ai':
        return css`
          background-color: ${colors.primary.purple};
          color: ${colors.neutral.white};
        `;      case 'system':
        return css`
          background-color: ${colors.semantic.warning};
          color: ${colors.neutral.white};
        `;
      case 'error':
        return css`
          background-color: ${colors.semantic.error};
          color: ${colors.neutral.white};
        `;
      default:
        return css`
          background-color: ${colors.neutral.gray300};
          color: ${colors.neutral.gray700};
        `;
    }
  }}
`;

export const MessageContent = styled.div`
  flex: 1;
`;

export const MessageText = styled.div`
  margin: 0;
  
  p {
    margin: 0 0 ${spacing.sm} 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  code {
    background-color: rgba(0, 0, 0, 0.1);
    padding: 2px 4px;
    border-radius: ${borderRadius.sm};
    font-family: ${typography.fontFamily.mono};
    font-size: 0.9em;
  }
  
  pre {
    background-color: ${colors.neutral.gray800};
    color: ${colors.neutral.white};
    padding: ${spacing.md};
    border-radius: ${borderRadius.md};
    overflow-x: auto;
    margin: ${spacing.sm} 0;
    
    code {
      background: none;
      padding: 0;
      color: inherit;
    }
  }
`;

export const MessageTimestamp = styled.div`
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral.gray400};
  margin-top: ${spacing.xs};
  text-align: center;
`;

export const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: ${spacing.sm};
  
  span {
    width: 6px;
    height: 6px;
    border-radius: ${borderRadius.full};
    background-color: ${colors.neutral.gray400};
    animation: typing 1.4s infinite ease-in-out both;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
    &:nth-child(3) { animation-delay: 0s; }
  }
  
  @keyframes typing {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

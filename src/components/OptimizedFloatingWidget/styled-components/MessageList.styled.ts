import styled from 'styled-components';
import { colors, spacing, typography } from '../styles/theme';

export const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${spacing.lg};
  background-color: ${colors.neutral.gray50};
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  min-height: 0; /* Important for flex child scrolling */
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.neutral.gray100};
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${colors.neutral.gray300};
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${colors.neutral.gray400};
  }
  
  /* Ensure smooth scrolling */
  scroll-behavior: smooth;
`;

export const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${colors.neutral.gray500};
  text-align: center;
`;

export const EmptyStateIcon = styled.div`
  width: 48px;
  height: 48px;
  margin-bottom: ${spacing.lg};
  color: ${colors.neutral.gray300};
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

export const EmptyStateTitle = styled.p`
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  margin: 0 0 4px 0;
`;

export const EmptyStateSubtitle = styled.p`
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral.gray400};
  margin: 0;
`;

export const ScrollAnchor = styled.div`
  height: 1px;
  width: 100%;
  flex-shrink: 0;
`;

export const TypingIndicatorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.md};
  background-color: ${colors.neutral.white};
  border-radius: ${spacing.md};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  align-self: flex-start;
  max-width: 70%;
`;

export const TypingIndicatorDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: ${colors.neutral.gray400};
  border-radius: 50%;
  animation: typingPulse 1.4s infinite ease-in-out;
  
  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
  
  @keyframes typingPulse {
    0%, 80%, 100% {
      opacity: 0.3;
      transform: scale(1);
    }
    40% {
      opacity: 1;
      transform: scale(1.2);
    }
  }
`;

export const TypingIndicatorText = styled.span`
  font-size: ${typography.fontSize.xs};
  color: ${colors.neutral.gray500};
  margin-left: ${spacing.xs};
`;

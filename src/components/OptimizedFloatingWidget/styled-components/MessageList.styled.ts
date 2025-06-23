import styled from 'styled-components';
import { colors, spacing, typography } from '../styles/theme';

export const MessageListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.lg};
  background-color: ${colors.neutral.gray50};
  display: flex;
  flex-direction: column;
  gap: ${spacing.lg};
  
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
`;

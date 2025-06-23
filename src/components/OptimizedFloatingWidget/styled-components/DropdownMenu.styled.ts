import styled, { css } from 'styled-components';
import { scaleIn } from '../styles/animations';
import { colors, shadows, spacing, borderRadius, zIndex, typography } from '../styles/theme';

interface DropdownContainerProps {
  position: { x: number; y: number };
}

export const DropdownContainer = styled.div<DropdownContainerProps>`
  position: fixed;
  left: ${props => props.position.x}px;
  top: ${props => props.position.y}px;
  z-index: ${zIndex.menu};
  pointer-events: auto;
  font-family: ${typography.fontFamily.system};
  animation: ${scaleIn} 0.15s ease-out;
`;

export const DropdownMenu = styled.div`
  position: relative;
  background-color: ${colors.neutral.white};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.xl};
  border: 1px solid ${colors.neutral.gray200};
  min-width: 200px;
  overflow: hidden;
  backdrop-filter: blur(10px);
`;

export const MenuSection = styled.div`
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.neutral.gray100};
  }
`;

interface MenuItemProps {
  variant?: 'default' | 'danger';
}

export const MenuItem = styled.button<MenuItemProps>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: ${spacing.md};
  padding: ${spacing.md} ${spacing.lg};
  background-color: transparent;
  border: none;
  color: ${props => props.variant === 'danger' ? colors.semantic.error : colors.neutral.gray700};
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.medium};
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
  
  &:hover {
    ${props => {
      switch (props.variant) {
        case 'danger':
          return css`
            background-color: #fef2f2;
            color: ${colors.semantic.error};
          `;
        default:
          return css`
            background-color: ${colors.neutral.gray50};
            color: ${colors.neutral.gray800};
          `;
      }
    }}
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:focus {
    outline: none;
    background-color: ${colors.primary.blue}15;
  }
`;

export const MenuIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

export const MenuLabel = styled.span`
  flex: 1;
`;

export const MenuSeparator = styled.div`
  height: 1px;
  background-color: ${colors.neutral.gray200};
  margin: ${spacing.xs} 0;
`;

export const MenuHeader = styled.div`
  padding: ${spacing.sm} ${spacing.lg};
  background-color: ${colors.neutral.gray50};
  border-bottom: 1px solid ${colors.neutral.gray200};
  font-size: ${typography.fontSize.xs};
  font-weight: ${typography.fontWeight.medium};
  color: ${colors.neutral.gray500};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const MenuCloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: ${borderRadius.full};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.neutral.gray500};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
    color: ${colors.neutral.gray700};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

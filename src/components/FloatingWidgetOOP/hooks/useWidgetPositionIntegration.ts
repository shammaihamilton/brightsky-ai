import { useState, useEffect } from 'react';
import { useDrag } from '../../../hooks/useDrag';
import type { Position } from '../interfaces';
import { useWidgetPosition, useWidgetState } from './index';

export const useWidgetPositionIntegration = () => {
  const positionService = useWidgetPosition();
  const stateService = useWidgetState();
  
  const [position, setPosition] = useState<Position>(positionService.getPosition());
  const { position: dragPosition, isDragging, handleMouseDown } = useDrag(position);

  // Update state service when dragging changes
  useEffect(() => {
    stateService.setDragging(isDragging);
  }, [isDragging, stateService]);

  // Update position when drag ends
  useEffect(() => {
    if (!isDragging) {
      positionService.setPosition(dragPosition);
      setPosition(dragPosition);
    }
  }, [dragPosition, isDragging, positionService]);

  return {
    position: dragPosition,
    isDragging,
    handleMouseDown,
    buttonSizeInPixels: (size?: string): number => {
      const sizeMap: Record<string, number> = {
        small: 44,
        medium: 56,
        large: 68
      };
      return sizeMap[size || 'medium'] || 56;
    }
  };
};

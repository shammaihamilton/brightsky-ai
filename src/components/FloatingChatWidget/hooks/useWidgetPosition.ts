import { useState, useEffect, useRef, useCallback } from "react";
import type { Position, DragData } from "../types/widget.types";
import { PositionCalculator } from "../services/positionCalculator";
import { StorageService } from "../services/storageService";
import { WIDGET_CONFIG } from "../config/widgetConfig";
import type { DraggableEvent } from "react-draggable";

export const useWidgetPosition = (isExpanded: boolean) => {
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  const wasDragged = useRef(false);  useEffect(() => {
    if (typeof window === "undefined" || isInitialized) return;

    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;

    const defaultX = winWidth - WIDGET_CONFIG.expanded.width - WIDGET_CONFIG.padding;
    const defaultY = winHeight - WIDGET_CONFIG.expanded.height - WIDGET_CONFIG.padding;

    const storedPosition = StorageService.loadPosition();
    const initialPosition = storedPosition || { x: defaultX, y: defaultY };

    const constrainedPosition = PositionCalculator.constrainToViewport(
      initialPosition,
      WIDGET_CONFIG.expanded,
      { width: winWidth, height: winHeight }
    );

    setPosition(constrainedPosition);
    setIsInitialized(true);
  }, [isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    const handleResize = () => {
      const windowSize = { width: window.innerWidth, height: window.innerHeight };
      const widgetSize = isExpanded ? WIDGET_CONFIG.expanded : WIDGET_CONFIG.collapsed;

      setPosition((currentPosition) => {
        const newPosition = PositionCalculator.constrainToViewport(
          currentPosition,
          widgetSize,
          windowSize
        );

        if (newPosition.x !== currentPosition.x || newPosition.y !== currentPosition.y) {
          StorageService.savePosition(newPosition);
        }

        return newPosition;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isInitialized, isExpanded]);

  const handleDrag = useCallback((_: DraggableEvent, data: DragData) => {
    wasDragged.current = true;
    setPosition({ x: data.x, y: data.y });
  }, []);

  const handleStop = useCallback((_: DraggableEvent, data: DragData) => {
    const windowSize = { width: window.innerWidth, height: window.innerHeight };
    const result = PositionCalculator.calculateSnapPosition(data, isExpanded, windowSize);

    wasDragged.current = false;
    setPosition(result.position);
    StorageService.savePosition(result.position);
  }, [isExpanded]);

  const movePosition = useCallback((direction: string) => {
    const step = 10;
    const currentWidth = isExpanded ? WIDGET_CONFIG.expanded.width : WIDGET_CONFIG.collapsed.width;

    setPosition((currentPosition) => {
      const newPosition = { ...currentPosition };

      switch (direction) {
        case "up":
          newPosition.y = Math.max(WIDGET_CONFIG.padding, currentPosition.y - step);
          break;
        case "down":
          newPosition.y = Math.min(
            window.innerHeight - WIDGET_CONFIG.expanded.height - WIDGET_CONFIG.padding,
            currentPosition.y + step
          );
          break;
        case "left":
          newPosition.x = Math.max(WIDGET_CONFIG.padding, currentPosition.x - step);
          break;
        case "right":
          newPosition.x = Math.min(
            window.innerWidth - currentWidth - WIDGET_CONFIG.padding,
            currentPosition.x + step
          );
          break;
      }

      StorageService.savePosition(newPosition);
      return newPosition;
    });
  }, [isExpanded]);

  const resetPosition = useCallback(() => {
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    const defaultPosition = {
      x: winWidth - WIDGET_CONFIG.expanded.width - WIDGET_CONFIG.padding,
      y: winHeight - WIDGET_CONFIG.expanded.height - WIDGET_CONFIG.padding,
    };

    setPosition(defaultPosition);
    StorageService.savePosition(defaultPosition);
  }, []);

  return {
    position,
    isInitialized,
    wasDragged,
    handleDrag,
    handleStop,
    movePosition,
    resetPosition,
  };
};

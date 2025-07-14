import { useState, useRef, useCallback } from "react";

interface Position {
  x: number;
  y: number;
}

interface UseDragReturn {
  position: Position;
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
}

export const useDrag = (initialPosition: Position): UseDragReturn => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<Position>({ x: 0, y: 0 });
  const elementStart = useRef<Position>({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const dragThreshold = 5; // pixels

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    // Check if we've moved enough to consider this a drag
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    if (distance > dragThreshold) {
      hasMoved.current = true;
      setIsDragging(true);
    }

    if (hasMoved.current) {
      const newX = elementStart.current.x + deltaX;
      const newY = elementStart.current.y + deltaY;

      // Keep widget within viewport bounds with some padding
      const padding = 10;
      const widgetSize = 64; // 16 * 4 (w-16 h-16 in Tailwind)
      const maxX = Math.max(padding, window.innerWidth - widgetSize - padding);
      const maxY = Math.max(padding, window.innerHeight - widgetSize - padding);

      setPosition({
        x: Math.max(padding, Math.min(newX, maxX)),
        y: Math.max(padding, Math.min(newY, maxY)),
      });
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    // Reset drag state after a small delay to allow click handlers to check isDragging
    setTimeout(() => {
      setIsDragging(false);
      hasMoved.current = false;
    }, 10);

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      dragStart.current = { x: e.clientX, y: e.clientY };
      elementStart.current = position;
      hasMoved.current = false;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [position, handleMouseMove, handleMouseUp],
  );

  return {
    position,
    isDragging: isDragging && hasMoved.current,
    handleMouseDown,
  };
};

import React, { useState, useEffect } from 'react';
import { useDrag } from '../hooks/useDrag';
import { useLocalStorage } from '../hooks/useLocalStorage';
import WidgetPanel from './WidgetPanel';

interface Position {
  x: number;
  y: number;
}

const FloatingWidget: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
    // Safe default position that works during SSR
  const getDefaultPosition = (): Position => {
    return { x: 50, y: 50 }; // Always start at a visible position
  };

  const [storedPosition, setStoredPosition] = useLocalStorage<Position>('widget-position', getDefaultPosition());

  const { position, isDragging, handleMouseDown } = useDrag(storedPosition);

  // Debug logging
  useEffect(() => {
    console.log('Widget position:', position);
    console.log('Window size:', { width: window.innerWidth, height: window.innerHeight });
  }, [position]);

  // Update position to default if window size changes and position is invalid
  useEffect(() => {
    const updatePosition = () => {
      const defaultPos = getDefaultPosition();
      if (storedPosition.x === 20 && storedPosition.y === 20) {
        setStoredPosition(defaultPos);
      }
    };
    
    // Set proper position after component mounts
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [storedPosition, setStoredPosition]);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (!isDragging) {
      setStoredPosition(position);
    }
  }, [position, isDragging, setStoredPosition]);

  // Handle window resize to keep widget in bounds
  useEffect(() => {
    const handleResize = () => {
      const maxX = window.innerWidth - 80;
      const maxY = window.innerHeight - 80;
      
      if (position.x > maxX || position.y > maxY) {
        const newPosition = {
          x: Math.min(position.x, maxX),
          y: Math.min(position.y, maxY),
        };
        setStoredPosition(newPosition);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, setStoredPosition]);

  const handleWidgetClick = (e: React.MouseEvent) => {
    // Only toggle panel if we're not dragging
    if (!isDragging) {
      e.stopPropagation();
      setIsPanelOpen(!isPanelOpen);
    }
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };
  return (
    <div 
      className="fixed z-50" 
      style={{ 
        left: position.x, 
        top: position.y,
        border: '2px solid red' // Debug border to make it visible
      }}
    >
      {/* Widget Button */}
      <div
        className={`
          relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 
          rounded-full shadow-lg cursor-pointer transform transition-all duration-200
          hover:scale-110 hover:shadow-xl active:scale-95
          ${isDragging ? 'scale-105 shadow-2xl' : ''}
          select-none
        `}
        onMouseDown={handleMouseDown}
        onClick={handleWidgetClick}
        role="button"
        tabIndex={0}
        aria-label="Open widget panel"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsPanelOpen(!isPanelOpen);
          }
        }}
      >
        {/* Widget Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
        </div>

        {/* Pulse animation when not dragging */}
        {!isDragging && (
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
        )}

        {/* Panel open indicator */}
        {isPanelOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      {/* Widget Panel */}
      <WidgetPanel isOpen={isPanelOpen} onClose={handleClosePanel} />

      {/* Click outside to close panel */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleClosePanel}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default FloatingWidget;

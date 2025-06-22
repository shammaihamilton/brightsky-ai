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
  
  // Start with a simple, always visible position
  const [storedPosition, setStoredPosition] = useLocalStorage<Position>('widget-position', {
    x: 50,
    y: 50
  });

  const { position, isDragging, handleMouseDown } = useDrag(storedPosition);

  // Debug logging
  useEffect(() => {
    console.log('Widget position:', position);
    console.log('Stored position:', storedPosition);
  }, [position, storedPosition]);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (!isDragging) {
      setStoredPosition(position);
    }
  }, [position, isDragging, setStoredPosition]);

  const handleWidgetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPanelOpen(!isPanelOpen);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <>      <div 
        className="fixed z-50" 
        style={{ 
          left: position.x, 
          top: position.y,
          border: '2px solid red', // Debug border
          position: 'fixed',
          zIndex: 9999,
          width: '68px',
          height: '68px'
        }}
      >{/* Widget Button */}
        <div
          className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg cursor-pointer"
          onMouseDown={handleMouseDown}
          onClick={handleWidgetClick}
          style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          {/* Simple icon */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div 
              className="w-6 h-6 bg-white rounded-full"
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: 'white',
                borderRadius: '50%'
              }}
            ></div>
          </div>
        </div>

        {/* Widget Panel */}
        {isPanelOpen && (
          <WidgetPanel isOpen={isPanelOpen} onClose={handleClosePanel} />
        )}
      </div>

      {/* Click outside to close panel */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleClosePanel}
        />
      )}
    </>
  );
};

export default FloatingWidget;

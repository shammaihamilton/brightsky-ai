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
  // Add debugging
  useEffect(() => {
    console.log('🎯 FloatingWidget component mounted!');
    console.log('📏 Window dimensions:', window.innerWidth, 'x', window.innerHeight);
    
    // Add a native click handler as backup
    const handleNativeClick = (e: MouseEvent) => {
      console.log('🔥 Native click detected!', e.target);
    };
    
    document.addEventListener('click', handleNativeClick);
    return () => document.removeEventListener('click', handleNativeClick);
  }, []);

  // Debug panel state changes
  useEffect(() => {
    console.log('🔄 Panel state changed to:', isPanelOpen);
  }, [isPanelOpen]);
  
  // Start with a position in the bottom-right corner
  const getDefaultPosition = (): Position => {
    return {
      x: Math.max(20, window.innerWidth - 100),
      y: Math.max(20, window.innerHeight - 100),
    };
  };

  const [storedPosition, setStoredPosition] = useLocalStorage<Position>(
    'chrome-extension-widget-position', 
    getDefaultPosition()
  );

  const { position, isDragging, handleMouseDown } = useDrag(storedPosition);

  // Save position to localStorage when it changes
  useEffect(() => {
    if (!isDragging) {
      setStoredPosition(position);
    }
  }, [position, isDragging, setStoredPosition]);

  // Handle window resize to keep widget in bounds
  useEffect(() => {
    const handleResize = () => {
      const padding = 10;
      const widgetSize = 64;
      const maxX = Math.max(padding, window.innerWidth - widgetSize - padding);
      const maxY = Math.max(padding, window.innerHeight - widgetSize - padding);
      
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
  }, [position, setStoredPosition]);  const handleWidgetClick = (e: React.MouseEvent) => {
    console.log('🖱️ Widget clicked! Event target:', e.target);
    console.log('🖱️ Current target:', e.currentTarget);
    console.log('🖱️ isDragging:', isDragging);
    console.log('🖱️ Current panel state:', isPanelOpen);
    
    e.preventDefault();
    e.stopPropagation();
    
    // Only toggle if not dragging
    if (!isDragging) {
      const newState = !isPanelOpen;
      console.log('📦 Setting panel to:', newState);
      setIsPanelOpen(newState);
    } else {
      console.log('🚫 Click ignored - widget is being dragged');
    }
  };
  const handleClosePanel = () => {
    console.log('❌ Closing panel');
    setIsPanelOpen(false);
  };  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    zIndex: 2147483647,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    pointerEvents: 'auto', // CRITICAL: Allow pointer events
    width: '64px',
    height: '64px',
  };  const widgetStyles: React.CSSProperties = {
    position: 'relative',
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    borderRadius: '50%',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
    cursor: isDragging ? 'grabbing' : 'pointer',
    transform: isDragging ? 'scale(1.05)' : 'scale(1)',
    transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
    userSelect: 'none',
    // Make the entire area clickable
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Enhanced visibility
    border: '2px solid rgba(255, 255, 255, 0.3)',
    // Ensure this is fully clickable
    overflow: 'visible',  };
  
  const iconStyles: React.CSSProperties = {
    width: '24px',
    height: '24px',
    color: 'white',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    pointerEvents: 'none', // Allow clicks to pass through
    zIndex: 1, // Keep icon above background animations
  };
  const indicatorStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '16px',
    height: '16px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    border: '2px solid white',
    display: isPanelOpen ? 'block' : 'none',
    pointerEvents: 'none', // Allow clicks to pass through
  };  return (
    <>
      <div style={containerStyles}>
        {/* Widget Button - entire area clickable */}
        <div
          style={widgetStyles}
          onMouseDown={handleMouseDown}
          onClick={handleWidgetClick}
          onMouseEnter={(e) => {
            console.log('🖱️ Mouse entered widget');
            if (!isDragging) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            console.log('🖱️ Mouse left widget');
            if (!isDragging) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open widget panel"
        >
          {/* Chat Icon - centered in flex container */}
          <svg 
            style={iconStyles} 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>

          {/* Panel open indicator */}
          {isPanelOpen && (
            <div style={indicatorStyles}></div>
          )}

          {/* Pulse animation when not dragging */}
          {!isDragging && (
            <div style={{
              position: 'absolute',
              inset: '0',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.4)',
              animation: 'pulse 2s infinite',
              pointerEvents: 'none', // Allow clicks to pass through
            }}></div>
          )}
        </div>

        {/* Widget Panel */}
        {isPanelOpen && (
          <WidgetPanel isOpen={isPanelOpen} onClose={handleClosePanel} />
        )}
      </div>

      {/* Click outside to close panel */}
      {isPanelOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2147483646,
          }}
          onClick={handleClosePanel}
        />
      )}

      {/* Inject pulse animation styles */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.2;
            }
          }
        `}
      </style>
    </>
  );
};

export default FloatingWidget;

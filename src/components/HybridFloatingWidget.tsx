import React, { useState, useEffect } from 'react';
import { useDrag } from '../hooks/useDrag';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Providers } from '../store/providers';
import ChatPanel from './FloatingChatWidget/components/ChatPanel';
import DropdownMenu from './FloatingChatWidget/components/DropdownMenu';
import MessageList from './FloatingChatWidget/MessageList';
import ChatInput from './FloatingChatWidget/components/InputArea';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearConversation } from '../store/slices/chatSlice';
import { selectConnectionStatus } from '../store/selectors/chatSelectors';
import { useChatSocket } from './FloatingChatWidget/hooks/useChatSocket';
import { addAiResponseChunk } from '../store/slices/chatSlice';

interface Position {
  x: number;
  y: number;
}

// Inner component that uses Redux hooks
const FloatingWidgetInner: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const chatPanelRef = React.useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector(selectConnectionStatus);

  // Chat socket functionality
  const { sendUserMessage } = useChatSocket(
    (chunk: string, messageId: string) => {
      dispatch(addAiResponseChunk({ messageId, chunk }));
    },
    (messageId: string) => {
      console.log('AI message done:', messageId);
    },
    (messageId: string, error: string) => {
      console.error('AI message error:', messageId, error);
    }
  );

  // Add debugging
  useEffect(() => {
    console.log('🎯 FloatingWidget component mounted!');
    console.log('📏 Window dimensions:', window.innerWidth, 'x', window.innerHeight);
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

  const handleWidgetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️ Widget clicked!', { isDragging });
    
    if (isDragging) return;
    
    setIsPanelOpen(!isPanelOpen);
    setShowMenu(false); // Close menu when opening chat
  };

  const handleClosePanel = () => {
    console.log('❌ Closing panel');
    setIsPanelOpen(false);
    setShowMenu(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleClearConversation = () => {
    dispatch(clearConversation());
    setShowMenu(false);
  };

  // Calculate chat panel position (similar to FloatingChatWidget)
  const getChatPanelPosition = () => {
    const panelWidth = 380;
    const panelHeight = 500;
    const padding = 20;
    
    let x = position.x - panelWidth + 64; // Align right edge with widget
    let y = position.y - panelHeight - 12; // Above the widget
    
    // Keep panel in viewport bounds
    if (x < padding) x = padding;
    if (y < padding) y = position.y + 64 + 12; // Below widget if no space above
    if (x + panelWidth > window.innerWidth - padding) {
      x = window.innerWidth - panelWidth - padding;
    }
    if (y + panelHeight > window.innerHeight - padding) {
      y = window.innerHeight - panelHeight - padding;
    }
    
    return { x, y };
  };

  const chatPanelPosition = getChatPanelPosition();

  const containerStyles: React.CSSProperties = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 2147483647,
    pointerEvents: 'auto',
    width: '64px',
    height: '64px',
  };

  const widgetStyles: React.CSSProperties = {
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    overflow: 'visible',
  };
  
  const iconStyles: React.CSSProperties = {
    width: '24px',
    height: '24px',
    color: 'white',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    pointerEvents: 'none',
    zIndex: 1,
  };

  const menuButtonStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '24px',
    height: '24px',
    backgroundColor: '#374151',
    borderRadius: '50%',
    border: '2px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  };

  const indicatorStyles: React.CSSProperties = {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    width: '16px',
    height: '16px',
    backgroundColor: connectionStatus === 'connected' ? '#10b981' : '#ef4444',
    borderRadius: '50%',
    border: '2px solid white',
    pointerEvents: 'none',
  };

  return (
    <>
      <div style={containerStyles}>
        {/* Widget Button */}
        <div
          style={widgetStyles}
          onMouseDown={handleMouseDown}
          onClick={handleWidgetClick}
          onMouseEnter={(e) => {
            if (!isDragging) {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0, 0, 0, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDragging) {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Open AI Assistant"
        >
          {/* Chat Icon */}
          <svg style={iconStyles} viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>

          {/* Connection Status Indicator */}
          <div style={indicatorStyles}></div>

          {/* Menu Button */}
          <div
            style={menuButtonStyles}
            onClick={handleMenuClick}
            role="button"
            aria-label="Menu"
          >
            <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </div>

          {/* Pulse animation when not dragging */}
          {!isDragging && (
            <div style={{
              position: 'absolute',
              inset: '0',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.4)',
              animation: 'pulse 2s infinite',
              pointerEvents: 'none',
            }}></div>
          )}
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <DropdownMenu
            onChatClick={() => {
              setIsPanelOpen(true);
              setShowMenu(false);
            }}
            onSettingsClick={() => {
              console.log('Settings clicked');
              setShowMenu(false);
            }}
            onKeyboardShortcutsClick={() => {
              console.log('Keyboard shortcuts clicked');
              setShowMenu(false);
            }}
            onClearConversation={handleClearConversation}
          />
        )}
      </div>

      {/* Chat Panel */}
      {isPanelOpen && (        <ChatPanel
          position={chatPanelPosition}
          connectionStatus={connectionStatus}
          onClose={handleClosePanel}
          chatPanelRef={chatPanelRef as React.RefObject<HTMLDivElement>}
        >
          <MessageList />
          <ChatInput onSend={sendUserMessage} connectionStatus={connectionStatus} />
        </ChatPanel>
      )}

      {/* Click outside to close */}
      {(isPanelOpen || showMenu) && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 2147483640,
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

// Wrapper component with Redux Provider
const HybridFloatingWidget: React.FC = () => {
  return (
    <Providers>
      <FloatingWidgetInner />
    </Providers>
  );
};

export default HybridFloatingWidget;

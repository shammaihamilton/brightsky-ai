import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from '../../hooks/useDrag';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Providers } from '../../store/providers';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearConversation } from '../../store/slices/chatSlice';
import { selectConnectionStatus, selectIsButtonVisible } from '../../store/selectors/chatSelectors';
import { useChatSocket } from '../FloatingChatWidget/hooks/useChatSocket';
import { addAiResponseChunk } from '../../store/slices/chatSlice';
import { zIndex } from './styles/theme';

// Import optimized components
import FloatingButton from './components/FloatingButtonStyled';
import ChatPanel from './components/ChatPanelStyled';
import DropdownMenu from './components/DropdownMenuStyled';

interface Position {
  x: number;
  y: number;
}

// Inner component that uses Redux hooks
const OptimizedFloatingWidgetInner: React.FC = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const chatPanelRef = useRef<HTMLDivElement>(null);const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const isVisible = useAppSelector(selectIsButtonVisible);
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
  );  // Start with a position in the bottom-right corner
  const getDefaultPosition = (): Position => {
    return {
      x: Math.max(20, window.innerWidth - 100),
      y: Math.max(20, window.innerHeight - 100),
    };
  };

  const [storedPosition, setStoredPosition] = useLocalStorage<Position>(
    'optimized-widget-position', 
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
    
    if (isDragging) return;
    
    setIsPanelOpen(!isPanelOpen);
    setShowMenu(false);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setShowMenu(false);
    setIsHovered(false);
  };  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newShowMenu = !showMenu;
    setShowMenu(newShowMenu);
    
    // If opening menu, ensure hover state is active
    if (newShowMenu) {
      setIsHovered(true);
    }
  };const handleSendMessage = (message: string) => {
    // Generate a unique message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sendUserMessage(message, messageId);
  };  const handleMouseEnter = () => {
    if (!isDragging) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      setIsHovered(false);
    }
  };

  // Simple menu handlers - no auto-close behavior
  const handleMenuMouseEnter = () => {
    // Menu stays open on hover
  };

  const handleMenuMouseLeave = () => {
    // Menu stays open - only closes on click outside or close button
  };

  // Calculate chat panel position
  const getChatPanelPosition = () => {
    const panelWidth = 380;
    const panelHeight = 500;
    const padding = 20;
    
    let x = position.x - panelWidth + 64;
    let y = position.y - panelHeight - 12;
    
    if (x < padding) x = padding;
    if (y < padding) y = position.y + 64 + 12;
    if (x + panelWidth > window.innerWidth - padding) {
      x = window.innerWidth - panelWidth - padding;
    }
    if (y + panelHeight > window.innerHeight - padding) {
      y = window.innerHeight - panelHeight - padding;
    }
      return { x, y };
  };  // Calculate dropdown menu position (1px away from button)
  const getMenuPosition = () => {
    const menuWidth = 200;
    const buttonSize = 64;
    const padding = 10;
    const gap = 1; // 1px gap as requested
    
    // Position menu directly adjacent to the button with 1px gap
    let x = position.x - menuWidth + buttonSize;
    let y = position.y + buttonSize + gap;
    
    // Adjust if menu would go off-screen
    if (x < padding) {
      x = position.x + buttonSize + gap; // Position to the right if too far left
    }
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (y + 300 > window.innerHeight - padding) { // Estimated menu height
      y = position.y - 300 - gap; // Position above if too low
    }
    
    return { x, y };
  };

  const chatPanelPosition = getChatPanelPosition();
  const menuPosition = getMenuPosition();

  // Debug logging
  useEffect(() => {
    console.log('🔍 OptimizedFloatingWidget Debug:', {
      isVisible,
      connectionStatus,
      position,
      isDragging,
      isHovered,
      isPanelOpen,
      showMenu
    });
  }, [isVisible, connectionStatus, position, isDragging, isHovered, isPanelOpen, showMenu]);

  if (!isVisible) {
    console.log('❌ Widget not visible - isVisible:', isVisible);
    return null;
  }

  console.log('✅ Widget should be visible now!');
  return (
    <div style={{ 
      position: 'fixed', 
      inset: 0, 
      pointerEvents: 'none', 
      zIndex: 2147483647, 
      fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      {/* Floating Button */}      <FloatingButton
        position={position}
        isDragging={isDragging}
        isHovered={isHovered}
        isPanelOpen={isPanelOpen}
        showMenu={showMenu}
        connectionStatus={connectionStatus}
        onMouseDown={handleMouseDown}
        onClick={handleWidgetClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMenuClick={handleMenuClick}
      />      {/* Dropdown Menu */}
      {showMenu && (
        <DropdownMenu
          position={menuPosition}
          onChatClick={() => {
            setIsPanelOpen(true);
            setShowMenu(false);
            setIsHovered(false);
          }}
          onSettingsClick={() => {
            console.log('Settings clicked');
            setShowMenu(false);
            setIsHovered(false);
          }}
          onKeyboardShortcutsClick={() => {
            console.log('Keyboard shortcuts clicked');
            setShowMenu(false);
            setIsHovered(false);
          }}
          onClearConversation={() => {
            dispatch(clearConversation());
            setShowMenu(false);
            setIsHovered(false);
          }}
          onClose={() => {
            setShowMenu(false);
            setIsHovered(false);
          }}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        />
      )}

      {/* Chat Panel */}
      {isPanelOpen && (
        <ChatPanel
          position={chatPanelPosition}
          connectionStatus={connectionStatus}
          onClose={handleClosePanel}
          onSend={handleSendMessage}
          chatPanelRef={chatPanelRef}
        />
      )}      {/* Click outside to close */}
      {(isPanelOpen || showMenu) && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'auto',
            zIndex: zIndex.overlay,
          }}
          onClick={() => {
            if (isPanelOpen) setIsPanelOpen(false);
            if (showMenu) {
              setShowMenu(false);
              setIsHovered(false);
            }
          }}
        />
      )}
    </div>
  );
};

// Wrapper component with Redux Provider
const OptimizedFloatingWidget: React.FC = () => {
  return (
    <Providers>
      <OptimizedFloatingWidgetInner />
    </Providers>
  );
};

export default OptimizedFloatingWidget;

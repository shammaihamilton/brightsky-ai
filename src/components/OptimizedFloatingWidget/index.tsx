import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from '../../hooks/useDrag';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Providers } from '../../store/providers';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearConversation, addMessageOptimistic, setConnectionStatus } from '../../store/slices/chatSlice';
import { selectConnectionStatus, selectIsButtonVisible } from '../../store/selectors/chatSelectors';
import { useAIChat } from '../FloatingChatWidget/hooks/useAIChat';
import { zIndex } from './styles/theme';
import { loadSettings } from '../../store/slices/settingsSlice';
import { ExtensionContext } from '../../utils/extensionContext';

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
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const isVisible = useAppSelector(selectIsButtonVisible);  // Load settings from Chrome storage on component mount
  useEffect(() => {
    const loadSettingsFromStorage = async () => {
      // Use the safe extension context wrapper
      await ExtensionContext.safeCall(async () => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.sync.get(['apiSettings'], (result) => {
            if (chrome.runtime.lastError) {
              console.error('Chrome storage error:', chrome.runtime.lastError);
              return;
            }
            
            console.log('📦 Loaded from Chrome storage:', result);
            
            if (result.apiSettings) {
              // Load the settings into Redux store
              dispatch(loadSettings(result.apiSettings));
              console.log('✅ Settings loaded into Redux:', result.apiSettings);
            } else {
              console.log('⚠️ No apiSettings found in Chrome storage');
            }
          });
        }
      });
    };
    
    loadSettingsFromStorage();
  }, [dispatch]);

  // AI chat functionality (replaces socket-based chat)
  const { sendMessage: sendAIMessage, isConfigured } = useAIChat();
  // Update connection status based on configuration
  useEffect(() => {
    console.log('🔧 Connection Status Update:', { isConfigured, connectionStatus });
    if (isConfigured) {
      // Show as connected when API key is configured
      dispatch(setConnectionStatus('connected'));
      console.log('✅ Setting connection status to CONNECTED');
    } else {
      // Show as disconnected when no API key
      dispatch(setConnectionStatus('disconnected'));
      console.log('❌ Setting connection status to DISCONNECTED');
    }
  }, [isConfigured, dispatch, connectionStatus]);// Start with a position in the bottom-right corner
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
  const handleCloseChatOnly = () => {
    // Only close chat panel, keep menu open if it was open
    setIsPanelOpen(false);
  };
  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newShowMenu = !showMenu;
    setShowMenu(newShowMenu);

    // If opening menu, ensure hover state is active
    if (newShowMenu) {
      setIsHovered(true);
    }
  };
  const handleSendMessage = (message: string) => {
    // First, add the user message to the store optimistically
    dispatch(addMessageOptimistic({ text: message }));

    // Generate a unique message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Send to AI using the new AI chat service
    sendAIMessage(message, messageId);
  };
  const handleMouseEnter = () => {
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
  }; // Calculate chat panel position (prefer left/above button)
  const getChatPanelPosition = () => {
    const panelWidth = 320; // Reduced from 380px - more compact
    const panelHeight = 280; // Much smaller - similar to menu height
    const buttonSize = 56; // Updated to match smaller button size
    const padding = 20;

    // Strategy: Chat panel prefers left side and above button
    let x = position.x - panelWidth + buttonSize; // Align right edge with button right edge
    let y = position.y - panelHeight - 12; // Position above button with gap

    // If panel would go off left edge, position to the right
    if (x < padding) {
      x = position.x + buttonSize + 12; // Position to the right of button
    }

    // If panel would go off top edge, position below
    if (y < padding) {
      y = position.y + buttonSize + 12; // Position below button
    }

    // If panel would go off right edge, adjust left
    if (x + panelWidth > window.innerWidth - padding) {
      x = window.innerWidth - panelWidth - padding;
    }

    // If panel would go off bottom edge, adjust up
    if (y + panelHeight > window.innerHeight - padding) {
      y = window.innerHeight - panelHeight - padding;
    }

    return { x, y };
  }; // Calculate dropdown menu position (avoid chat panel area)
  const getMenuPosition = () => {
    const menuWidth = 200;
    const menuHeight = 300; // Estimated menu height
    const buttonSize = 56; // Updated to match smaller button size
    const padding = 10;
    const gap = 1;

    // Strategy: Position menu in opposite direction from chat panel
    // Chat panel prefers left/above, so menu will prefer right/below

    let x = position.x + buttonSize + gap; // Start to the right of button
    let y = position.y + buttonSize + gap; // Start below button

    // If menu would go off right edge, try left side
    if (x + menuWidth > window.innerWidth - padding) {
      x = position.x - menuWidth - gap;
    }

    // If menu would go off bottom edge, try above
    if (y + menuHeight > window.innerHeight - padding) {
      y = position.y - menuHeight - gap;
    }

    // Final boundary checks
    if (x < padding) x = padding;
    if (y < padding) y = padding; // Ensure menu doesn't overlap with chat panel if both are open
    if (isPanelOpen) {
      const chatPanel = getChatPanelPosition();
      // If menu would overlap with chat panel, move it further right
      if (x < chatPanel.x + 320 && x + menuWidth > chatPanel.x &&
          y < chatPanel.y + 280 && y + menuHeight > chatPanel.y) {
        x = Math.min(window.innerWidth - menuWidth - padding, chatPanel.x + 320 + 10);
      }
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
      showMenu,
      chatPanelPosition: isPanelOpen ? chatPanelPosition : 'closed',
      menuPosition: showMenu ? menuPosition : 'closed'
    });
  }, [isVisible, connectionStatus, position, isDragging, isHovered, isPanelOpen, showMenu, chatPanelPosition, menuPosition]);

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
          isPanelOpen={isPanelOpen}          onChatClick={() => {
            if (isPanelOpen) {
              // Close chat if it's open - keep menu open to show state change
              setIsPanelOpen(false);
            } else {
              // Open chat if it's closed - keep menu open to show state change
              setIsPanelOpen(true);
            }
            // Don't close menu - let user see the button change and interact more
            // setShowMenu(false);
            // setIsHovered(false);
          }}          onSettingsClick={() => {
            console.log('Settings clicked - Opening Chrome extension popup');            
            
            // Check extension context and handle errors gracefully
            if (!ExtensionContext.isValid()) {
              ExtensionContext.showContextError();
              setShowMenu(false);
              setIsHovered(false);
              return;
            }
            
            // Send message to background script to open popup with error handling
            if (typeof chrome !== 'undefined' && chrome.runtime) {
              try {
                chrome.runtime.sendMessage({ action: 'openPopup' }, () => {
                  if (chrome.runtime.lastError) {
                    // Handle extension context invalidated error
                    if (chrome.runtime.lastError.message?.includes('Extension context invalidated')) {
                      ExtensionContext.showContextError();
                    } else {
                      console.warn('Could not open popup:', chrome.runtime.lastError.message);
                    }
                  } else {
                    console.log('Popup opened successfully');
                  }
                });
              } catch (error) {
                console.warn('Chrome runtime error:', error);
                ExtensionContext.showContextError();
              }
            } else {
              console.warn('Chrome extension API not available');
            }
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
      )}      {/* Chat Panel */}
      {isPanelOpen && (
        <ChatPanel
          position={chatPanelPosition}
          connectionStatus={connectionStatus}
          onClose={handleCloseChatOnly}
          onSend={handleSendMessage}
          chatPanelRef={chatPanelRef}
        />
      )}{/* Click outside to close */}
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

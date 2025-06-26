import React, { useState, useEffect, useRef } from "react";
import { useDrag } from "../../hooks/useDrag";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { Providers } from "../../store/providers";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  clearConversation,
  setConnectionStatus,
} from "../../store/slices/chatSlice";
import {
  selectConnectionStatus,
  selectIsButtonVisible,
} from "../../store/selectors/chatSelectors";
import {
  selectButtonSize,
  selectPrivacySettings,
  selectAccessibilitySettings,
} from "../../store/selectors/settingsSelectors";
import { useAIChat } from "../../hooks/useAIChat";
import { loadSettings } from "../../store/slices/settingsSlice";
import { updateChatSettings } from "../../store/slices/chatSettingsSlice";
import { ExtensionContext } from "../../utils/extensionContext";
import { NotificationService } from "../../services/notificationService";

// Import CSS Custom Properties components
import FloatingButton from "./components/FloatingButton";
import ChatPanel from "./components/ChatPanel";
import DropdownMenu from "./components/DropdownMenu";

interface Position {
  x: number;
  y: number;
}

// Inner component that uses Redux hooks - EXACT same logic as OptimizedFloatingWidget
const FloatingWidgetInner: React.FC = () => {
  // Helper function to get actual button size in pixels
  const getButtonSizeInPixels = (size?: string): number => {
    const sizeMap: Record<string, number> = {
      small: 44,
      medium: 56,
      large: 68
    };
    return sizeMap[size || 'medium'] || 56;
  };

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const isVisible = useAppSelector(selectIsButtonVisible);
  const buttonSize = useAppSelector(selectButtonSize);
  const privacySettings = useAppSelector(selectPrivacySettings);
  const accessibilitySettings = useAppSelector(selectAccessibilitySettings);

  // EXACT same storage loading logic
  useEffect(() => {
    const loadSettingsFromStorage = async () => {
      await ExtensionContext.safeCall(async () => {
        if (typeof chrome !== "undefined" && chrome.storage) {
          chrome.storage.sync.get(["apiSettings", "chatSettings"], (result) => {
            if (chrome.runtime.lastError) {
              console.error("Chrome storage error:", chrome.runtime.lastError);
              return;
            }

            console.log('Loading settings from storage:', result);

            if (result.apiSettings) {
              dispatch(loadSettings(result.apiSettings));
            }
            
            if (result.chatSettings) {
              console.log('Loading chat settings:', result.chatSettings);
              dispatch(updateChatSettings(result.chatSettings));
            }
          });
        }
      });
    };

    loadSettingsFromStorage();
  }, [dispatch]);

  // EXACT same storage change listener
  useEffect(() => {
    const handleStorageChange = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName === 'sync') {
        console.log('Storage changed:', changes);
        
        if (changes.chatSettings) {
          console.log('Chat settings changed, updating widget:', changes.chatSettings.newValue);
          dispatch(updateChatSettings(changes.chatSettings.newValue));
        }
        
        if (changes.apiSettings) {
          console.log('API settings changed, updating widget:', changes.apiSettings.newValue);
          dispatch(loadSettings(changes.apiSettings.newValue));
        }
      }
    };

    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, [dispatch]);

  // AI chat functionality
  const { sendMessage: sendAIMessage, isConfigured } = useAIChat();

  // Update connection status based on configuration
  useEffect(() => {
    if (isConfigured) {
      dispatch(setConnectionStatus("connected"));
      console.log("AI is configured - connection status set to connected");
    } else {
      dispatch(setConnectionStatus("disconnected"));
      console.log("AI is not configured - connection status set to disconnected");
    }
  }, [isConfigured, dispatch]);

  // Initialize notification service - EXACT same
  useEffect(() => {
    NotificationService.initialize();
  }, []);

  // Start with a position in the bottom-right corner - EXACT same
  const getDefaultPosition = (): Position => {
    return {
      x: Math.max(20, window.innerWidth - 100),
      y: Math.max(20, window.innerHeight - 100),
    };
  };

  const [storedPosition, setStoredPosition] = useLocalStorage<Position>(
    "optimized-widget-position",
    getDefaultPosition()
  );

  const { position, isDragging, handleMouseDown } = useDrag(storedPosition);

  // Save position to localStorage when it changes - EXACT same
  useEffect(() => {
    if (!isDragging) {
      setStoredPosition(position);
    }
  }, [position, isDragging, setStoredPosition]);

  // EXACT same event handlers
  const handleWidgetClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isDragging) return;

    setIsPanelOpen(!isPanelOpen);
    setShowMenu(false);
  };

  const handleCloseChatOnly = () => {
    setIsPanelOpen(false);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const newShowMenu = !showMenu;
    setShowMenu(newShowMenu);

    if (newShowMenu) {
      setIsHovered(true);
    }
  };

  const handleSendMessage = (message: string) => {
    // Send to AI using the new AI chat service
    sendAIMessage(message);
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

  // Simple menu handlers - EXACT same
  const handleMenuMouseEnter = () => {
    // Menu stays open on hover
  };

  const handleMenuMouseLeave = () => {
    // Menu stays open - only closes on click outside or close button
  };

  // Calculate chat panel position (prefer left/above button) - EXACT same
  const getChatPanelPosition = () => {
    const panelWidth = 320;
    const panelHeight = 280;
    
    const actualButtonSize = getButtonSizeInPixels(buttonSize);
    const padding = 20;

    let x = position.x - panelWidth + actualButtonSize;
    let y = position.y - panelHeight - 12;

    if (x < padding) {
      x = position.x + actualButtonSize + 12;
    }

    if (y < padding) {
      y = position.y + actualButtonSize + 12;
    }

    if (x + panelWidth > window.innerWidth - padding) {
      x = window.innerWidth - panelWidth - padding;
    }

    if (y + panelHeight > window.innerHeight - padding) {
      y = window.innerHeight - panelHeight - padding;
    }

    return { x, y };
  };

  // Calculate dropdown menu position - EXACT same
  const getMenuPosition = () => {
    const menuWidth = 200;
    const menuHeight = 300;
    
    const actualButtonSize = getButtonSizeInPixels(buttonSize);
    const padding = 10;
    const gap = 1;

    let x = position.x + actualButtonSize + gap;
    let y = position.y + actualButtonSize + gap;

    if (x + menuWidth > window.innerWidth - padding) {
      x = position.x - menuWidth - gap;
    }

    if (y + menuHeight > window.innerHeight - padding) {
      y = position.y - menuHeight - gap;
    }

    if (x < padding) x = padding;
    if (y < padding) y = padding;

    if (isPanelOpen) {
      const chatPanel = getChatPanelPosition();
      if (
        x < chatPanel.x + 320 &&
        x + menuWidth > chatPanel.x &&
        y < chatPanel.y + 280 &&
        y + menuHeight > chatPanel.y
      ) {
        x = Math.min(
          window.innerWidth - menuWidth - padding,
          chatPanel.x + 320 + 10
        );
      }
    }

    return { x, y };
  };

  const chatPanelPosition = getChatPanelPosition();
  const menuPosition = getMenuPosition();

  // Dropdown menu handlers (EXACT same as OptimizedFloatingWidget)
  const handleCloseMenu = () => {
    console.log("Menu close button clicked!");
    setShowMenu(false);
    setIsHovered(false);
  };

  const handleSettingsClick = () => {
    // Check extension context and handle errors gracefully
    if (!ExtensionContext.isValid()) {
      ExtensionContext.showContextError();
      setShowMenu(false);
      setIsHovered(false);
      return;
    }

    // Send message to background script to open popup with error handling
    if (typeof chrome !== "undefined" && chrome.runtime) {
      try {
        chrome.runtime.sendMessage({ action: "openPopup" }, () => {
          if (chrome.runtime.lastError) {
            // Handle extension context invalidated error
            if (
              chrome.runtime.lastError.message?.includes(
                "Extension context invalidated"
              )
            ) {
              ExtensionContext.showContextError();
            } else {
              console.warn(
                "Could not open popup:",
                chrome.runtime.lastError.message
              );
            }
          } else {
            // Success - popup opened
          }
        });
      } catch (error) {
        console.warn("Chrome runtime error:", error);
        ExtensionContext.showContextError();
      }
    } else {
      console.warn("Chrome extension API not available");
    }
    setShowMenu(false);
    setIsHovered(false);
  };

  const handleKeyboardShortcutsClick = () => {
    alert("Keyboard Shortcuts:\n• Ctrl+Shift+A: Toggle widget\n• Enter: Send message\n• Shift+Enter: New line\n• Esc: Close chat");
    setShowMenu(false);
    setIsHovered(false);
  };

  const handleClearConversation = () => {
    console.log("Clear conversation clicked!");
    if (window.confirm("Are you sure you want to clear all messages? This cannot be undone.")) {
      dispatch(clearConversation());
      console.log("Conversation cleared successfully");
    }
    setShowMenu(false);
    setIsHovered(false);
  };

  // Auto-clear messages based on privacy settings - EXACT same
  useEffect(() => {
    if (privacySettings?.autoClearDays && privacySettings.autoClearDays > 0) {
      const clearOldMessages = () => {
        const cutoffDate = new Date();
        cutoffDate.setDate(
          cutoffDate.getDate() - (privacySettings.autoClearDays ?? 0)
        );

        console.log(
          `Auto-clear enabled: clearing messages older than ${privacySettings.autoClearDays} days`
        );
      };

      clearOldMessages();
      const interval = setInterval(clearOldMessages, 24 * 60 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [privacySettings?.autoClearDays]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 2147483647,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Floating Button - Using CSS Custom Properties */}
      <FloatingButton
        position={position}
        isDragging={isDragging}
        isHovered={isHovered}
        isPanelOpen={isPanelOpen}
        showMenu={showMenu}
        buttonSize={buttonSize}
        accessibilitySettings={accessibilitySettings}
        onMouseDown={handleMouseDown}
        onClick={handleWidgetClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMenuClick={handleMenuClick}
      />

      {/* Dropdown Menu */}
      {showMenu && (
        <DropdownMenu
          position={menuPosition}
          isPanelOpen={isPanelOpen}
          onChatClick={() => {
            if (isPanelOpen) {
              // Close chat if it's open - keep menu open to show state change
              setIsPanelOpen(false);
            } else {
              // Open chat if it's closed - keep menu open to show state change
              setIsPanelOpen(true);
            }
            // Don't close menu - let user see the button change and interact more
          }}
          onSettingsClick={handleSettingsClick}
          onKeyboardShortcutsClick={handleKeyboardShortcutsClick}
          onClearConversation={handleClearConversation}
          onClose={handleCloseMenu}
          onMouseEnter={handleMenuMouseEnter}
          onMouseLeave={handleMenuMouseLeave}
        />
      )}

      {/* Chat Panel */}
      {isPanelOpen && (
        <ChatPanel
          position={chatPanelPosition}
          connectionStatus={connectionStatus}
          onClose={handleCloseChatOnly}
          onSend={handleSendMessage}
          chatPanelRef={chatPanelRef}
        />
      )}

      {/* Click outside to close - EXACT same */}
      {(isPanelOpen || showMenu) && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "auto",
            zIndex: 2147483643,
          }}
          onClick={() => {
            console.log("Click outside detected");
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

// Wrapper component with Redux Provider - EXACT same
const FloatingWidget: React.FC = () => {
  return (
    <Providers>
      <FloatingWidgetInner />
    </Providers>
  );
};

export default FloatingWidget;

  import React, { useRef } from 'react';
  import { Providers } from '../../store/providers';
  import { useAppSelector } from '../../store/hooks';
  import {
    selectConnectionStatus,
    selectIsButtonVisible,
    selectIsTyping,
  } from '../../store/selectors/chatSelectors';
  import {
    selectButtonSize,
    selectAccessibilitySettings,
  } from '../../store/selectors/settingsSelectors';

  // Import SOLID architecture components
  import { WidgetProvider } from './context/WidgetContext';
  import { useWidgetPositionIntegration } from './hooks/useWidgetPositionIntegration';
  import { useWidgetStateIntegration } from './hooks/useWidgetStateIntegration';
  import { 
    useStorageIntegration,
    useConnectionStatus,
    usePrivacySettings,
    useNotificationService,
    usePositionCalculations,
    useWidgetEventHandlers
  } from './hooks';

  // Import UI components
  import FloatingButton from './components/FloatingButton';
  import ChatPanel from './components/ChatPanel';
  import DropdownMenu from './components/DropdownMenu';

  /**
   * This component now follows the Single Responsibility Principle:
   * - Only handles UI orchestration and rendering
   * - All business logic moved to custom hooks
   * - Each hook has a single, focused responsibility
   */
  const FloatingWidgetOOPInner: React.FC = () => {
    const chatPanelRef = useRef<HTMLDivElement>(null);
    
    // Redux selectors (only what's needed for rendering)
    const connectionStatus = useAppSelector(selectConnectionStatus);
    const isVisible = useAppSelector(selectIsButtonVisible);
    const buttonSize = useAppSelector(selectButtonSize);
    const isTyping = useAppSelector(selectIsTyping);
    
    const accessibilitySettings = useAppSelector(selectAccessibilitySettings);

    // Custom hooks handle all business logic
    const { position, isDragging, handleMouseDown, buttonSizeInPixels } = useWidgetPositionIntegration();
    const widgetState = useWidgetStateIntegration();
    const actualButtonSize = buttonSizeInPixels(buttonSize);
    const { chatPanelPosition, menuPosition } = usePositionCalculations(position, actualButtonSize, widgetState.isPanelOpen);
    const { handleClearConversationClick, handleChatToggle, handleClickOutside, eventService, handleSendMessage } = useWidgetEventHandlers();
    
    // Side effects handled by focused hooks
    useStorageIntegration();
    useConnectionStatus();
    usePrivacySettings();
    useNotificationService();
    if (!isVisible) {
      return null;
    }

    if (!connectionStatus) {
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
        {/* Floating Button */}
        <FloatingButton
          position={position}
          isDragging={isDragging}
          isHovered={widgetState.isHovered}
          isPanelOpen={widgetState.isPanelOpen}
          showMenu={widgetState.showMenu}
          buttonSize={buttonSize}
          accessibilitySettings={accessibilitySettings}
          onMouseDown={handleMouseDown}
          onClick={(e) => eventService.handleWidgetClick(e, isDragging)}
          onMouseEnter={() => eventService.handleMouseEnter()}
          onMouseLeave={() => eventService.handleMouseLeave()}
          onMenuClick={(e) => eventService.handleMenuClick(e)}
        />

        {/* Dropdown Menu */}
        {widgetState.showMenu && (
          <DropdownMenu
            position={menuPosition}
            isPanelOpen={widgetState.isPanelOpen}
            onChatClick={handleChatToggle}
            onSettingsClick={() => eventService.handleSettingsClick()}
            onKeyboardShortcutsClick={() => eventService.handleKeyboardShortcutsClick()}
            onClearConversation={handleClearConversationClick}
            onClose={() => eventService.handleCloseMenu()}
            onMouseEnter={() => {/* Menu stays open on hover */}}
            onMouseLeave={() => {/* Menu stays open */}}
          />
        )}

        {/* Chat Panel */}
        {widgetState.isPanelOpen && (
          <ChatPanel
            position={chatPanelPosition}
            connectionStatus={connectionStatus}
            onClose={() => eventService.handleCloseChat()}
            onSend={handleSendMessage}
            chatPanelRef={chatPanelRef}
            isTyping={isTyping}
          />
        )}

        {/* Click outside to close */}
        {(widgetState.isPanelOpen || widgetState.showMenu) && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "auto",
              zIndex: 2147483643,
            }}
            onClick={handleClickOutside}
          />
        )}
      </div>
    );
  };

  // Main wrapper component with dependency injection
  const FloatingWidgetOOP: React.FC = () => {
    return (
      <Providers>
        <WidgetProvider
          config={{
            storageKey: 'optimized-widget-position-oop',
            panelDimensions: { width: 320, height: 280 },
            menuDimensions: { width: 200, height: 300 },
          }}
        >
          <FloatingWidgetOOPInner />
        </WidgetProvider>
      </Providers>
    );
  };

  export default FloatingWidgetOOP;

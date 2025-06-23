"use client";

import React from "react";
import Draggable from "react-draggable";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearConversation } from "../../store/slices/chatSlice";
import {
  selectIsButtonVisible,
  selectUnreadMessageCount,
  selectConnectionStatus,
} from "../../store/selectors/chatSelectors";
import { useChatSocket } from "./hooks/useChatSocket";
import { addAiResponseChunk } from "../../store/slices/chatSlice";
import MessageList from "./MessageList/index";
import ChatInput from "./components/InputArea";

// Import refactored components and hooks
import { useWidgetPosition } from "./hooks/useWidgetPosition";
import { useWidgetState } from "./hooks/useWidgetState";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { PositionCalculator } from "./services/positionCalculator";
import { WIDGET_CONFIG } from "./config/widgetConfig";
import DragHandle from "./components/DragHandle";
import ChatButton from "./components/ChatButton";
import MenuButton from "./components/MenuButton";
import DropdownMenu from "./components/DropdownMenu";
import ChatPanel from "./components/ChatPanel";
import { Providers } from "@/store/providers";

const FloatingChatWidget: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const isVisible = useAppSelector(selectIsButtonVisible);
  const unreadCount = useAppSelector(selectUnreadMessageCount);
  const connectionStatus = useAppSelector(selectConnectionStatus);

  // Custom hooks
  const {
    isExpanded,
    setIsExpanded,
    showMenu,
    showChat,
    setIsHelpModalOpen,
    nodeRef,
    chatPanelRef,
    handleMouseEnter,
    handleMouseLeave,
    toggleChat,
    toggleMenu,
    closeAll,
  } = useWidgetState();

  const { position, isInitialized, wasDragged, handleDrag, handleStop, movePosition } =
    useWidgetPosition(isExpanded);

  const { handleKeyDown } = useKeyboardNavigation({
    movePosition,
    isExpanded,
    setIsExpanded,
    closeAll,
  });

  // Chat functionality
  const { sendUserMessage } = useChatSocket(
    (chunk: string, messageId: string) => {
      dispatch(addAiResponseChunk({ messageId, chunk }));
    },
    (messageId: string) => {
      dispatch(addAiResponseChunk({ messageId, chunk: "", isFinal: true }));
    }
  );

  const handleClearConversation = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the entire conversation history? This cannot be undone."
      )
    ) {
      dispatch(clearConversation());
      closeAll();
    }
  };

  const openChatSettings = () => {
    closeAll();
  };

  const openKeyboardShortcuts = () => {
    setIsHelpModalOpen(true);
    closeAll();
  };

  const handleFocus = () => setIsExpanded(true);

  const handleBlur = (e: React.FocusEvent) => {
    if (
      !nodeRef.current?.contains(e.relatedTarget as Node) &&
      !chatPanelRef.current?.contains(e.relatedTarget as Node)
    ) {
      closeAll();
    }
  };  // Early return if not visible or initialized
  if (!isVisible || !isInitialized) return null;

  // Calculate chat panel position
  const chatPanelPosition = PositionCalculator.calculateChatPanelPosition(
    position,
    isExpanded,
    { width: window.innerWidth, height: window.innerHeight }
  );

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  // const isMobile = false

  const currentWidth = isExpanded ? WIDGET_CONFIG.expanded.width : WIDGET_CONFIG.collapsed.width;

  return (
    <>
      <Draggable
        nodeRef={nodeRef as React.RefObject<HTMLElement>}
        onDrag={isMobile ? undefined : handleDrag}
        onStop={isMobile ? undefined : handleStop}
        position={position}
        disabled={isMobile}
        handle=".drag-handle"
        bounds={{
          left: WIDGET_CONFIG.padding,
          top: WIDGET_CONFIG.padding,
          right: window.innerWidth - WIDGET_CONFIG.expanded.width - WIDGET_CONFIG.padding,
          bottom: window.innerHeight - WIDGET_CONFIG.expanded.height - WIDGET_CONFIG.padding,
        }}
      >
        <div
          ref={nodeRef}
          className="fixed bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 z-50 duration-50 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            width: `${currentWidth}px`,
            height: `${WIDGET_CONFIG.expanded.height}px`,
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="toolbar"
          aria-label="Floating chat widget - Use arrow keys to move, Enter to expand/collapse"
        >
          <div className="flex h-full">
            {!isExpanded ? (
              <ChatButton
                onClick={toggleChat}
                unreadCount={unreadCount}
                isExpanded={false}
                wasDragged={wasDragged}
              />
            ) : (
              <>
                <DragHandle />
                <ChatButton
                  onClick={toggleChat}
                  unreadCount={unreadCount}
                  isExpanded={true}
                  wasDragged={wasDragged}
                />
                <MenuButton onClick={toggleMenu} wasDragged={wasDragged} />
              </>
            )}
          </div>

          {showMenu && (
            <DropdownMenu
              onChatClick={toggleChat}
              onSettingsClick={openChatSettings}
              onKeyboardShortcutsClick={openKeyboardShortcuts}
              onClearConversation={handleClearConversation}
            />
          )}
        </div>
      </Draggable>

      {showChat && (
        <ChatPanel
          position={chatPanelPosition}
          connectionStatus={connectionStatus}
          onClose={() => toggleChat()}
          chatPanelRef={chatPanelRef as React.RefObject<HTMLDivElement>}
        >
          <MessageList />
          <ChatInput onSend={sendUserMessage} connectionStatus={connectionStatus} />
        </ChatPanel>
      )}
    </>
  );
};

// export default FloatingChatWidget;


const FloatingAiWidget: React.FC = () => {
  return (
    <Providers>
      <FloatingChatWidget />
    </Providers>
  );
};

export default FloatingAiWidget;
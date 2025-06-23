import React from "react";
import { ChatBubbleOvalLeftEllipsisIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { Position } from "../types/widget.types";
import { WIDGET_CONFIG } from "../config/widgetConfig";

interface ChatPanelProps {
  position: Position;
  connectionStatus: string;
  onClose: () => void;
  chatPanelRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  position,
  connectionStatus,
  onClose,
  chatPanelRef,
  children,
}) => {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "bg-green-500";
      case "connecting":
        return "bg-yellow-500";
      default:
        return "bg-red-500";
    }
  };

  return (
    <div
      ref={chatPanelRef}
      className="fixed bg-white dark:bg-gray-900 text-black dark:text-white shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg z-40 flex flex-col"
      style={{
        width: `${WIDGET_CONFIG.chatPanel.width}px`,
        height: `${WIDGET_CONFIG.chatPanel.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold">AI Assistant</h3>
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          aria-label="Close chat"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
    </div>
  );
};

export default ChatPanel;

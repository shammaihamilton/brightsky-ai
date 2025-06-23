import React, { memo } from "react";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid";
import { DeviceDetection } from "../utils/deviceDetection";

interface ChatButtonProps {
  onClick: () => void;
  unreadCount: number;
  isExpanded: boolean;
  wasDragged: React.MutableRefObject<boolean>;
  disabled?: boolean;
  loading?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = memo(({
  onClick,
  unreadCount,
  isExpanded,
  wasDragged,
  disabled = false,
  loading = false,
}) => {
  const handleClick = () => {
    if (disabled || loading) return;

    if (wasDragged.current) {
      wasDragged.current = false;
      return;
    }

    onClick();

    if (DeviceDetection.supportsVibration()) {
      navigator.vibrate(50);
    }
  };

  const baseClasses = "flex items-center justify-center transition-all duration-200 relative focus:outline-none focus:ring-2 focus:ring-blue-500";
  const stateClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "hover:bg-gray-700 active:bg-gray-600";
  const expandedClasses = "flex-1 border-r border-gray-700";
  const collapsedClasses = "w-full h-full rounded-lg";

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${isExpanded ? expandedClasses : collapsedClasses}`}
      aria-label={
        loading
          ? "Loading..."
          : unreadCount > 0
          ? `Open AI Chat (${unreadCount} unread)${!isExpanded ? " - Hover to expand" : ""}`
          : `Open AI Chat${!isExpanded ? " - Hover to expand" : ""}`
      }
      aria-pressed={isExpanded}
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      ) : (
        <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
      )}

      {unreadCount > 0 && !loading && (
        <span
          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-1 ring-gray-900 animate-pulse"
          aria-label={`${unreadCount} unread messages`}
        >
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
});

ChatButton.displayName = "ChatButton";

export default ChatButton;

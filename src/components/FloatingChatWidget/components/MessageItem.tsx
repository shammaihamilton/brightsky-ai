// /components/Chat/ChatModal/MessageItem.tsx
import React, { useState } from "react";
import type { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { format } from "date-fns";
import type { Message, MessageStatus } from "@/types/chat.types";
import {
  ClipboardDocumentIcon,
  CheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

interface MessageItemProps {
  message: Message;
  style?: CSSProperties;
}

// Helper to format timestamp
const formatTimestamp = (isoString: string): string => {
  try {
    // Add basic validation
    if (!isoString || isNaN(new Date(isoString).getTime())) return "";
    return format(new Date(isoString), "HH:mm");
  } catch {
    return "";
  }
};

// Status Indicator Component
const StatusIndicator: React.FC<{ status: MessageStatus }> = ({ status }) => {
  switch (status) {
    case "sending":
      return (
        <ClockIcon
          className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0"
          title="Sending..."
        />
      );
    case "sent":
      return (
        <CheckIcon
          className="w-3 h-3 text-green-500 dark:text-green-400 flex-shrink-0"
          title="Sent"
        />
      );
    case "failed":
      return (
        <ExclamationCircleIcon
          className="w-3 h-3 text-red-500 dark:text-red-400 flex-shrink-0"
          title="Failed"
        />
      );
    default:
      return null;
  }
};

const CustomCodeBlock: Components["code"] = (props) => {
  const { className, children, ...otherProps } = props;
  const codeString = String(children).replace(/\n$/, ""); // Clean up trailing newline

  // Check if this is inline code by looking at the className or other props
  const isInline =
    !className?.startsWith("language-") && !otherProps.node?.tagName;

  // Remove problematic props that conflict with SyntaxHighlighter
  // const { ref: _unusedRef, style: _unusedStyle, ...cleanProps } = otherProps;

  // Handle block code (```code```)
  if (!isInline) {
    return (
      <div className="relative group/code my-2 bg-[#1e1e1e] rounded overflow-x-auto text-sm">
        {" "}
        {/* Container for bg and scroll */}
        <SyntaxHighlighter>{codeString}</SyntaxHighlighter>
        <button
          onClick={() => navigator.clipboard.writeText(codeString)}
          className="absolute top-1 right-1 p-1 bg-gray-600/70 hover:bg-gray-500/80 rounded text-white opacity-0 group-hover/code:opacity-100 transition-opacity text-xs z-10"
          aria-label="Copy code"
        >
          Copy
        </button>
      </div>
    );
  }

  return (
    <code
      className={`bg-gray-300 dark:bg-gray-600 px-1 py-0.5 rounded text-xs font-mono ${
        className || ""
      }`}
    >
      {children}
    </code>
  );
};

// --- Main Message Item Component ---
const MessageItem: React.FC<MessageItemProps> = ({ message, style }) => {
  const [copied, setCopied] = useState(false);

  const isUser = message.sender === "user";
  const isAi = message.sender === "ai";
  const isError = message.sender === "error";
  const isSystem = message.sender === "system";

  // Define bubble styles
  const bubbleClasses = isUser
    ? "bg-blue-600 dark:bg-blue-700 text-white ml-auto" // Adjusted blue slightly
    : isAi
    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 mr-auto"
    : isError
    ? "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 mr-auto border border-red-200 dark:border-red-700/50"
    : "bg-transparent text-gray-500 dark:text-gray-400 text-center text-xs mx-auto italic py-1"; // System message style

  // Define container alignment and add group for hover effects
  const containerClasses = isUser
    ? "flex justify-end group"
    : isSystem
    ? "w-full px-4"
    : "flex justify-start group";

  const handleCopy = () => {
    navigator.clipboard
      .writeText(message.text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  };

  return (
    // Apply react-window style to the outermost element
    <div style={style} className={`${containerClasses} relative my-1`}>
      {" "}
      {/* Added my-1 for vertical spacing */}
      {!isSystem && (
        // Bubble container
        <div
          className={`relative max-w-[85%] sm:max-w-[75%] rounded-lg px-3 py-2 shadow-sm text-sm ${bubbleClasses} prose dark:prose-invert max-w-none`}
        >
          {/* Markdown Renderer */}
          <ReactMarkdown
            // Apply prose classes for markdown styling. Ensure typography plugin is configured.
            // max-w-none prevents prose from limiting width inside the bubble.

            remarkPlugins={[remarkGfm]}
            components={{
              code: CustomCodeBlock, // Use the explicitly typed component
              a: ({ ...props }) => (
                <a
                  {...props}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-100 dark:text-blue-400 hover:underline font-medium"
                />
              ),
              // Add basic styling for other markdown elements if needed
              p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
              ul: ({ ...props }) => (
                <ul className="list-disc list-inside mb-2" {...props} />
              ),
              ol: ({ ...props }) => (
                <ol className="list-decimal list-inside mb-2" {...props} />
              ),
              li: ({ ...props }) => <li className="mb-1" {...props} />,
              strong: ({ ...props }) => (
                <strong className="font-semibold" {...props} />
              ),
            }}
          >
            {message.text}
          </ReactMarkdown>

          {/* Timestamp and Status */}
          <div
            className={`flex items-center space-x-1.5 mt-1.5 text-xs ${
              isUser
                ? "justify-end text-blue-100/90"
                : "justify-start text-gray-500 dark:text-gray-400/90"
            }`}
          >
            {/* Add spacer for AI to align timestamp/status like user messages */}
            {isAi && (
              <div className="w-3 flex-shrink-0">
              
              </div>
            )}
            <span className="flex-shrink-0">
              {formatTimestamp(message.timestamp)}
            </span>
            {isUser && <StatusIndicator status={message.status} />}
          </div>
        </div>
      )}
      {/* System Message Rendering */}
      {isSystem && (
        <div className={bubbleClasses}>
          {message.text} -{" "}
          <span className="text-xs">{formatTimestamp(message.timestamp)}</span>
        </div>
      )}
      {/* Copy button for entire message - appears on hover */}
      {!isSystem && !isError && (
        <button
          onClick={handleCopy}
          // Adjust positioning based on sender for better placement
          className={`absolute p-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100 top-1/2 transform -translate-y-1/2 z-10 ${
            isUser ? "left-1 sm:left-[-32px]" : "right-1 sm:right-[-32px]"
          }`}
          aria-label={copied ? "Copied!" : "Copy message"}
        >
          {copied ? (
            <CheckIcon className="w-4 h-4 text-green-500" />
          ) : (
            <ClipboardDocumentIcon className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};

export default MessageItem;

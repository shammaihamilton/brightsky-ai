import React, { useState, useRef, useCallback } from "react";
import { IoSend } from "react-icons/io5";
import styles from '../styles/ChatInput.module.css';

interface ChatInputProps {
  onSend: (message: string) => void;
  connectionStatus: "connected" | "disconnected" | "connecting" | "error";
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  connectionStatus,
}) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 2000;
  
  const handleSend = useCallback(() => {
    if (message.trim() && connectionStatus === "connected") {
      onSend(message.trim());
      setMessage(""); // Reset textarea height after sending
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = "16px";
      }
    }
  }, [message, connectionStatus, onSend]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      if (value.length <= maxLength) {
        setMessage(value);

        // Auto-resize textarea
        const target = e.target;
        target.style.height = "auto";
        target.style.height = `${Math.min(target.scrollHeight, 80)}px`;
      }
    },
    [maxLength]
  );
  
  const isDisabled = connectionStatus !== "connected";
  const isOverLimit = message.length > maxLength * 0.9;
  const canSend = message.trim().length > 0 && connectionStatus === "connected";

  const getPlaceholder = () => {
    switch (connectionStatus) {
      case "connected":
        return "Type your message...";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Type your message... (API might not be configured)";
      case "error":
        return "Type your message... (Check API settings)";
      default:
        return "Type your message...";
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Connection Error";
      default:
        return "Unknown";
    }
  };

  return (
    <div className={styles.chatInputContainer}>
      <div 
        className={`${styles.connectionStatusIndicator} ${styles[`status-${connectionStatus}`]}`}
      >
        {/* {getStatusText()} */}
        
      </div>

      <div className={styles.inputWrapper}>
        <div className={styles.textAreaWrapper}>
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            className={`${styles.styledTextArea} ${isDisabled ? styles.disabled : ''}`}
            rows={1}
            style={{
              height: "auto",
              minHeight: "16px",
              maxHeight: "80px",
            }}
            aria-label="Type your message"
            aria-describedby={
              message.length > maxLength * 0.8 ? "char-count" : undefined
            }
            disabled={isDisabled}
          />
          {message.length > maxLength * 0.8 && (
            <div
              className={`${styles.characterCount} ${isOverLimit ? styles.overLimit : ''}`}
              id="char-count"
              role="status"
              aria-live="polite"
            >
              {message.length}/{maxLength}
            </div>
          )}
        </div>
        <button
          onClick={handleSend}
          className={`${styles.sendButton} ${canSend ? styles.enabled : styles.disabledButton}`}
          disabled={!canSend}
          aria-label={canSend ? "Send message" : "Cannot send message"}
          title={canSend ? "Send message (Enter)" : getStatusText()}
        >
          <IoSend size={14} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;

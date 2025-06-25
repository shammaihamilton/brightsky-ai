import React, { useState, useRef, useCallback } from "react";
import { IoSend } from "react-icons/io5";
import {
  ChatInputContainer,
  InputWrapper,
  TextAreaWrapper,
  StyledTextArea,
  SendButton,
  CharacterCount,
  ConnectionStatusIndicator,
} from "../styled-components";

interface ChatInputProps {
  onSend: (message: string) => void;
  connectionStatus: "connected" | "disconnected" | "connecting" | "error";
}

const ChatInputStyled: React.FC<ChatInputProps> = ({
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
  const canSend = message.trim().length > 0 && !isDisabled;

  const getPlaceholder = () => {
    switch (connectionStatus) {
      case "connected":
        return "Type your message...";
      case "connecting":
        return "Connecting...";
      case "disconnected":
        return "Disconnected";
      case "error":
        return "Connection error";
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
    <ChatInputContainer>
      <ConnectionStatusIndicator status={connectionStatus}>
        {getStatusText()}
      </ConnectionStatusIndicator>

      <InputWrapper>
        <TextAreaWrapper>
          <StyledTextArea
            ref={inputRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
            isDisabled={isDisabled}
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
          />
          {message.length > maxLength * 0.8 && (
            <CharacterCount
              isOverLimit={isOverLimit}
              id="char-count"
              role="status"
              aria-live="polite"
            >
              {message.length}/{maxLength}
            </CharacterCount>
          )}
        </TextAreaWrapper>
        <SendButton
          onClick={handleSend}
          isEnabled={canSend}
          disabled={!canSend}
          aria-label={canSend ? "Send message" : "Cannot send message"}
          title={canSend ? "Send message (Enter)" : getStatusText()}
        >
          <IoSend size={14} />
        </SendButton>
      </InputWrapper>
    </ChatInputContainer>
  );
};

export default ChatInputStyled;

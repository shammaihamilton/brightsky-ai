import React, { useState, useRef } from 'react';
import {
  ChatInputContainer,
  InputWrapper,
  TextAreaWrapper,
  StyledTextArea,
  SendButton,
  CharacterCount,
  ConnectionStatusIndicator,
} from '../styled-components';

interface ChatInputProps {
  onSend: (message: string) => void;
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
}

const ChatInputStyled: React.FC<ChatInputProps> = ({ onSend, connectionStatus }) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 2000;  const handleSend = () => {
    if (message.trim() && connectionStatus === 'connected') {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }
  };
  const isDisabled = connectionStatus !== 'connected';
  const isOverLimit = message.length > maxLength * 0.9;
  const canSend = message.trim().length > 0 && !isDisabled;

  const getPlaceholder = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Type your message...';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection error';
      default:
        return 'Type your message...';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Connection Error';
      default:
        return 'Unknown';
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
            rows={1}            style={{
              height: 'auto',
              minHeight: '32px',
              maxHeight: '80px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 80)}px`;
            }}
          />
          {message.length > maxLength * 0.8 && (
            <CharacterCount isOverLimit={isOverLimit}>
              {message.length}/{maxLength}
            </CharacterCount>
          )}
        </TextAreaWrapper>        <SendButton
          onClick={handleSend}
          isEnabled={canSend}
          disabled={!canSend}
          aria-label="Send message"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </SendButton>
      </InputWrapper>
    </ChatInputContainer>
  );
};

export default ChatInputStyled;

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
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 2000;

  const handleSend = () => {
    if (message.trim() && connectionStatus === 'connected' && !isTyping) {
      onSend(message.trim());
      setMessage('');
      setIsTyping(false);
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
      setIsTyping(value.length > 0);
    }
  };

  const isDisabled = connectionStatus !== 'connected' || isTyping;
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
            rows={1}
            style={{
              height: 'auto',
              minHeight: '44px',
              maxHeight: '120px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
          />
          {message.length > maxLength * 0.8 && (
            <CharacterCount isOverLimit={isOverLimit}>
              {message.length}/{maxLength}
            </CharacterCount>
          )}
        </TextAreaWrapper>

        <SendButton
          onClick={handleSend}
          isEnabled={canSend}
          disabled={!canSend}
          aria-label="Send message"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </SendButton>
      </InputWrapper>
    </ChatInputContainer>
  );
};

export default ChatInputStyled;

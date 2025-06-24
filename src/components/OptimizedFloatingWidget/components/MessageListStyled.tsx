import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../../../store/hooks';
import { selectIsAiLoading } from '../../../store/selectors/chatSelectors';
import type { Message } from '../../../types/chat.types';
import {
  MessageListContainer,
  EmptyStateContainer,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateSubtitle,
  ScrollAnchor,
  TypingIndicatorContainer,
  TypingIndicatorDot,
  TypingIndicatorText,
} from '../styled-components';
import MessageItemStyled from './MessageItemStyled';

interface MessageListProps {
  messages: Message[];
}

const MessageListStyled: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAiLoading = useAppSelector(selectIsAiLoading);
  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiLoading]);
  // Also scroll when component mounts with existing messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  return (
    <MessageListContainer>
      {messages.length === 0 ? (
        <EmptyStateContainer>
          <EmptyStateIcon>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </EmptyStateIcon>
          <EmptyStateTitle>Start a conversation</EmptyStateTitle>
          <EmptyStateSubtitle>Ask me anything!</EmptyStateSubtitle>
        </EmptyStateContainer>
      ) : (        <>
          {messages.map((message) => (
            <MessageItemStyled key={message.id} message={message} />
          ))}
          {isAiLoading && (
            <TypingIndicatorContainer>
              <TypingIndicatorDot />
              <TypingIndicatorDot />
              <TypingIndicatorDot />
              <TypingIndicatorText>AI is typing...</TypingIndicatorText>
            </TypingIndicatorContainer>
          )}
          <ScrollAnchor ref={messagesEndRef} />
        </>
      )}
    </MessageListContainer>
  );
};

export default MessageListStyled;

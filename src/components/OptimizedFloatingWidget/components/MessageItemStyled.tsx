import React from 'react';
import type { Message } from '../../../types/chat.types';
import {
  MessageContainer,
  MessageBubble,
  MessageAvatar,
  MessageContent,
  MessageText,
  MessageTimestamp,
} from '../styled-components';

interface MessageItemProps {
  message: Message;
}

const MessageItemStyled: React.FC<MessageItemProps> = ({ message }) => {  const getAvatarText = (sender: string) => {
    switch (sender) {
      case 'user':
        return 'U';
      case 'ai':
        return 'AI';
      case 'system':
        return 'S';
      case 'error':
        return 'E';
      default:
        return '?';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  };

  return (
    <MessageContainer sender={message.sender}>
      <MessageAvatar sender={message.sender}>
        {getAvatarText(message.sender)}
      </MessageAvatar>
      <MessageContent>        <MessageBubble sender={message.sender}>
          <MessageText>
            <p>{message.text}</p>
          </MessageText>
        </MessageBubble>
        <MessageTimestamp>
          {formatTimestamp(message.timestamp)}
        </MessageTimestamp>
      </MessageContent>
    </MessageContainer>
  );
};

export default MessageItemStyled;

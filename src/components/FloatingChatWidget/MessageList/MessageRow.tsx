
// /components/Chat/MessageList/MessageRow.tsx
import React, { type CSSProperties } from 'react';
import type { MessageListItem } from './types';
import MessageItem from '../components/MessageItem';
import TypingIndicator from '../components/TypingIndicator';

interface MessageRowProps {
  item: MessageListItem;
  style: CSSProperties;
}

export const MessageRow: React.FC<MessageRowProps> = ({ item, style }) => {
  return (
    <div style={style}>
      <div className="px-4 py-2">
        {item.type === 'message' && (
          <MessageItem message={item.message} />
        )}
        {item.type === 'typing' && (
          <TypingIndicator />
        )}
        {item.type === 'error' && (
          <MessageItem message={item.errorMessage} />
        )}
      </div>
    </div>
  );
};

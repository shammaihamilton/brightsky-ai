// Simplified MessageList for Chrome extension (no virtualization)
import React, { useEffect, useRef } from 'react';
import type { MessageListItem } from './types';
import { MessageRow } from './MessageRow';

interface SimpleMessageListProps {
  items: MessageListItem[];
}

export const SimpleMessageList: React.FC<SimpleMessageListProps> = ({ 
  items 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items]);

  return (
    <div 
      ref={scrollRef}
      className="h-full overflow-y-auto overflow-x-hidden"
      style={{ maxHeight: '100%' }}
    >
      {items.map((item, index) => (
        <MessageRow 
          key={`${item.type}-${index}`}
          item={item} 
          style={{}} 
        />
      ))}
    </div>
  );
};

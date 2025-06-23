// /components/Chat/MessageList/VirtualizedMessageList.tsx
import React, { useEffect, useRef } from 'react';
import { FixedSizeList as List, type ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import type { MessageListItem } from './types';
import { MessageRow } from './MessageRow';

const ESTIMATED_ROW_HEIGHT = 80;

interface VirtualizedMessageListProps {
  items: MessageListItem[];
}

export const VirtualizedMessageList: React.FC<VirtualizedMessageListProps> = ({ 
  items 
}) => {
  const listRef = useRef<List>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (items.length > 0 && listRef.current) {
      listRef.current.scrollToItem(items.length - 1, 'end');
    }
  }, [items]);

  const Row = ({ index, style }: ListChildComponentProps) => (
    <MessageRow 
      item={items[index]} 
      style={style} 
    />
  );

  return (
    <AutoSizer>
      {({ height, width }) => (
        <List
          ref={listRef}
          height={height}
          itemCount={items.length}
          itemSize={ESTIMATED_ROW_HEIGHT}
          width={width}
          overscanCount={5}
        >
          {Row}
        </List>
      )}
    </AutoSizer>
  );
};
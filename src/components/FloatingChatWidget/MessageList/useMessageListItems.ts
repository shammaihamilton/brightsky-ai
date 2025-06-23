import { useMemo } from 'react';
import type { Message } from '../../../types/chat.types';
import type { MessageListItem } from './types';

export const useMessageListItems = (
  messages: Message[],
  isLoading: boolean,
  error: string | null
): MessageListItem[] => {
  return useMemo(() => {
    const items: MessageListItem[] = messages.map(message => ({
      type: 'message' as const,
      id: message.id,
      message
    }));

    // Add typing indicator as a list item
    if (isLoading) {
      items.push({
        type: 'typing' as const,
        id: 'typing-indicator'
      });
    }

    // Add error as a list item
    if (error) {
      items.push({
        type: 'error' as const,
        id: 'error-message',
        errorMessage: {
          id: 'error-msg',
          sender: 'error',
          text: `Error: ${error}`,
          timestamp: new Date().toISOString(),
          status: 'failed'
        }
      });
    }

    return items;
  }, [messages, isLoading, error]);
};

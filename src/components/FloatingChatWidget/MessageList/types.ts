import type { Message } from '../../../types/chat.types';

export type MessageListItem = 
  | { type: 'message'; id: string; message: Message }
  | { type: 'typing'; id: string }
  | { type: 'error'; id: string; errorMessage: Message };

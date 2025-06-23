// /utils/messageFactory.ts

import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types/chat.types';

/**
 * Create a new user message with a default structure.
 * @param text The message content from the user.
 * @returns A new user Message object.
 */
export const createUserMessage = (text: string): Message => {
  return {
    id: uuidv4(),
    text,
    sender: 'user',
    timestamp: new Date().toISOString(),
    status: 'sending',
  };
};

/**
 * Create a new queued message for offline sending.
 * @param text The message content from the user.
 * @returns A new user Message object marked as offline.
 */
export const createQueuedMessage = (text: string): Message => {
  return {
    ...createUserMessage(text),
    isOffline: true,
  };
};

/**
 * Create a new AI message, either as a full message or from a streamed chunk.
 * @param chunk The initial text chunk from the AI.
 * @param id Optional message ID (useful for continuing streams).
 * @returns A new AI Message object.
 */
export const createAiMessage = (chunk: string, id?: string): Message => {
  const safeChunk = chunk ?? '';
  return {
    id: id ?? uuidv4(),
    text: safeChunk,
    tokens: [safeChunk],
    seenChunks: [safeChunk],
    sender: 'ai',
    timestamp: new Date().toISOString(),
    status: 'sent',
  };
};

/**
 * Create an empty AI message skeleton to append chunks later.
 * Useful for initializing a streaming response before any tokens arrive.
 * @param id The known message ID.
 * @returns A blank AI message with initialized token tracking arrays.
 */
export const createEmptyAiMessage = (id: string): Message => {
  return {
    id,
    text: '',
    tokens: [],
    seenChunks: [],
    sender: 'ai',
    timestamp: new Date().toISOString(),
    status: 'sending',
  };
};

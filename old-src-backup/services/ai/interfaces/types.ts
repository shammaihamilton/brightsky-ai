import { AIProvider, ConversationTone } from '../enums/AIProvider';

/**
 * Configuration for AI service
 */
export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  tone?: ConversationTone;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * AI service request options
 */
export interface AIRequestOptions {
  tone?: ConversationTone;
  tools?: string[];
  maxTokens?: number;
  temperature?: number;
}

/**
 * AI service response
 */
export interface AIResponse {
  success: boolean;
  content: string;
  provider: AIProvider;
  error?: string;
  metadata?: {
    model?: string;
    usage?: any;
    finishReason?: string;
    toolUsed?: string;
    toolResult?: string;
  };
}

/**
 * Stream chunk for real-time responses
 */
export interface StreamChunk {
  messageId: string;
  chunk: string;
  isFinal: boolean;
}

/**
 * Base AI service configuration
 */
export interface BaseAIConfig {
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  tone?: ConversationTone;
}

/**
 * AI service error types
 */
export interface AIServiceError extends Error {
  provider: AIProvider;
  statusCode?: number;
  originalError?: unknown;
}

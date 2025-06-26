import { AIProvider, ConversationTone } from "../enums/AIProvider";

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
  role: "system" | "user" | "assistant";
  content: string;
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

import type { ChatMessage, StreamChunk } from "./types";




export interface IAIService {

  sendMessage(
    message: string,
    conversationHistory?: ChatMessage[],
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<string>;

  /**
   * Get the system message for the current configuration
   */
  getSystemMessage(): string;

  /**
   * Validate the API key format
   */
  validateApiKey(apiKey: string): boolean;

  /**
   * Get the provider name
   */
  getProviderName(): string;
}

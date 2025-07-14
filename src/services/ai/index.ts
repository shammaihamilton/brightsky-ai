// Main exports for the AI services module
import { AIServiceRouter } from "./router/AIServiceRouter";
import type {
  AIServiceConfig,
  ChatMessage,
  StreamChunk,
} from "./interfaces/types";
import { AIProvider } from "./enums/AIProvider";

export { AIServiceRouter } from "./router/AIServiceRouter";
export { AIServiceFactory } from "./factory/AIServiceFactory";

// Enum exports
export {
  AIProvider,
  ConversationTone,
  isValidAIProvider,
  isValidConversationTone,
} from "./enums/AIProvider";

// Type exports
export type {
  AIServiceConfig,
  ChatMessage,
  StreamChunk,
  BaseAIConfig,
  AIServiceError,
} from "./interfaces/types";

export type { IAIService } from "./interfaces/IAIService";

// Provider exports (for direct use if needed)
export { OpenAIService } from "./providers/OpenAIService";
export { ClaudeService } from "./providers/ClaudeService";
export { GeminiService } from "./providers/GeminiService";
export { BaseAIService } from "./base/BaseAIService";

// Create a default router instance for convenience
export const defaultAIRouter = new AIServiceRouter();

/**
 * Convenience function to send a message using the default router
 */
export async function sendAIMessage(
  config: AIServiceConfig,
  message: string,
  conversationHistory?: ChatMessage[],
  onChunk?: (chunk: StreamChunk) => void,
): Promise<string> {
  return defaultAIRouter.sendMessage(
    config,
    message,
    conversationHistory,
    onChunk,
  );
}

/**
 * Convenience function to get system message using the default router
 */
export function getAISystemMessage(config: AIServiceConfig): string {
  return defaultAIRouter.getSystemMessage(config);
}

/**
 * Convenience function to validate API key using the default router
 */
export function validateAIApiKey(
  provider: AIProvider,
  apiKey: string,
): boolean {
  return defaultAIRouter.validateApiKey(provider, apiKey);
}

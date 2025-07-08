import { 
  AIServiceRouter, 
  AIProvider, 
  ConversationTone,
  isValidConversationTone 
} from "./ai";
import type { 
  AIServiceConfig as NewAIServiceConfig,
  ChatMessage,
  StreamChunk 
} from "./ai";

export interface AIServiceConfig {
  provider: "openai" | "claude" | "gemini" | AIProvider | string ; // Allow legacy string or enum
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  tone?: string;
  /**
   * Optional custom endpoint for the AI provider
   * Useful for self-hosted or alternative providers
   */
  endpoint?: string;
  /**
   * Optional model name to use for the AI provider
   * If not provided, defaults to the provider's default model
   */
  model?: string;
  /**
   * Optional custom headers to include in the request
   * Useful for additional authentication or metadata
   */
  headers?: Record<string, string>;
  /**
   * Optional timeout for the request in milliseconds
   * Defaults to 30000 (30 seconds)
   */
  timeout?: number;
  /**
   * Optional flag to enable/disable streaming responses
   * Defaults to false
   */
  enableStreaming?: boolean;
  /**
   * Optional flag to enable/disable conversation history
   * Defaults to true
   */
  enableConversationHistory?: boolean;
  /**
   * Optional flag to enable/disable error handling
   * Defaults to true
   */
  enableErrorHandling?: boolean;
}
export type { ChatMessage, StreamChunk };


export class AIService {
  private router: AIServiceRouter;
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.router = new AIServiceRouter();
    this.config = {
      ...config,
      maxTokens: config.maxTokens || 4000,
      temperature: config.temperature || 0.7,
    };
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<string> {
    try {
      // Convert legacy config to new config format
      const newConfig = this.convertToNewConfig(this.config);
      
      // Use the new router to send the message
      return await this.router.sendMessage(
        newConfig,
        message,
        conversationHistory,
        onChunk
      );
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  }

  /**
   * Convert legacy config to new config format
   */
  private convertToNewConfig(legacyConfig: AIServiceConfig): NewAIServiceConfig {
    // Convert provider string to enum
    let provider: AIProvider;
    switch (legacyConfig.provider) {
      case "openai":
        provider = AIProvider.OPENAI;
        break;
      case "claude":
        provider = AIProvider.CLAUDE;
        break;
      case "gemini":
        provider = AIProvider.GEMINI;
        break;
      default:
        throw new Error(`Unsupported provider: ${legacyConfig.provider}`);
    }

    // Convert tone string to enum
    let tone: ConversationTone = ConversationTone.FRIENDLY;
    if (legacyConfig.tone && isValidConversationTone(legacyConfig.tone)) {
      tone = legacyConfig.tone as ConversationTone;
    }

    return {
      provider,
      apiKey: legacyConfig.apiKey,
      maxTokens: legacyConfig.maxTokens,
      temperature: legacyConfig.temperature,
      tone,
    };
  }

  getSystemMessage(): string {
    return "You are a helpful AI assistant.";
  }

  validateApiKey(apiKey: string): boolean {
    return typeof apiKey === "string" && apiKey.length > 0;
  }

  getProviderName(): string {
    return this.config.provider;
  }
}

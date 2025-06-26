
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
  provider: "openai" | "claude" | "gemini";
  apiKey: string;
  maxTokens?: number;
  temperature?: number;
  tone?: string;
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
}

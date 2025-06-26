import type { IAIService } from "../interfaces/IAIService";
import type { BaseAIConfig } from "../interfaces/types";
import { AIProvider } from "../enums/AIProvider";
import { OpenAIService } from "../providers/OpenAIService";
import { ClaudeService } from "../providers/ClaudeService";
import { GeminiService } from "../providers/GeminiService";

/**
 * Factory class for creating AI service instances
 */
export class AIServiceFactory {
  /**
   * Create an AI service instance based on the provider
   */
  static createService(provider: AIProvider, config: BaseAIConfig): IAIService {
    switch (provider) {
      case AIProvider.OPENAI:
        return new OpenAIService(config);
      case AIProvider.CLAUDE:
        return new ClaudeService(config);
      case AIProvider.GEMINI:
        return new GeminiService(config);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }

  /**
   * Get all supported providers
   */
  static getSupportedProviders(): AIProvider[] {
    return Object.values(AIProvider);
  }

  /**
   * Validate if a provider is supported
   */
  static isProviderSupported(provider: string): provider is AIProvider {
    return this.getSupportedProviders().includes(provider as AIProvider);
  }
}

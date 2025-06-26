import type { IAIService } from "../interfaces/IAIService";
import type { AIServiceConfig, ChatMessage, StreamChunk } from "../interfaces/types";
import { AIProvider, isValidAIProvider } from "../enums/AIProvider";
import { AIServiceFactory } from "../factory/AIServiceFactory";

/**
 * Central router for AI services
 * Implements the router pattern to delegate requests to appropriate AI services
 */
export class AIServiceRouter {
  private services: Map<string, IAIService> = new Map();

  constructor() {
    // Initialize services lazily when needed
  }

  /**
   * Send a message using the specified AI provider
   */
  async sendMessage(
    config: AIServiceConfig,
    message: string,
    conversationHistory: ChatMessage[] = [],
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<string> {
    try {
      // Validate provider
      if (!isValidAIProvider(config.provider)) {
        throw new Error(`Invalid AI provider: ${config.provider}`);
      }

      // Get or create service instance
      const service = this.getService(config);

      // Send message through the appropriate service
      return await service.sendMessage(message, conversationHistory, onChunk);
    } catch (error) {
      console.error("AI Service Router Error:", error);
      throw error;
    }
  }

  /**
   * Get system message for a specific provider configuration
   */
  getSystemMessage(config: AIServiceConfig): string {
    if (!isValidAIProvider(config.provider)) {
      throw new Error(`Invalid AI provider: ${config.provider}`);
    }

    const service = this.getService(config);
    return service.getSystemMessage();
  }

  /**
   * Validate API key for a specific provider
   */
  validateApiKey(provider: AIProvider, apiKey: string): boolean {
    try {
      const service = AIServiceFactory.createService(provider, { apiKey });
      return service.validateApiKey(apiKey);
    } catch {
      return false;
    }
  }

  /**
   * Get all supported providers
   */
  getSupportedProviders(): AIProvider[] {
    return AIServiceFactory.getSupportedProviders();
  }

  /**
   * Check if a provider is supported
   */
  isProviderSupported(provider: string): provider is AIProvider {
    return AIServiceFactory.isProviderSupported(provider);
  }

  /**
   * Get or create a service instance for the given configuration
   */
  private getService(config: AIServiceConfig): IAIService {
    const cacheKey = this.createCacheKey(config);
    
    if (!this.services.has(cacheKey)) {
      const service = AIServiceFactory.createService(config.provider, {
        apiKey: config.apiKey,
        maxTokens: config.maxTokens,
        temperature: config.temperature,
        tone: config.tone,
      });
      
      this.services.set(cacheKey, service);
    }

    return this.services.get(cacheKey)!;
  }

  /**
   * Create a cache key for service instances
   */
  private createCacheKey(config: AIServiceConfig): string {
    // Use a combination of provider and settings for a unique key
    return `${config.provider}-${config.apiKey}-${config.temperature || ''}-${config.tone || ''}`;
  }

  /**
   * Clear service cache (useful for testing or when configs change significantly)
   */
  clearCache(): void {
    this.services.clear();
  }
}

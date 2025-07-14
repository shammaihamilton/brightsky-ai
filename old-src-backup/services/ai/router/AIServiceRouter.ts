import { AIProvider } from '../enums/AIProvider';
import { OpenAIService } from '../implementations/OpenAIService';
import type {
  AIServiceConfig,
  ChatMessage,
  AIResponse,
  AIRequestOptions,
} from '../interfaces/types';

/**
 * AI Service Router that routes requests to appropriate AI providers
 */
export class AIServiceRouter {
  private openaiService: OpenAIService | null = null;

  async sendMessage(
    config: AIServiceConfig,
    message: string,
    history: ChatMessage[] = [],
    options: AIRequestOptions = {},
  ): Promise<AIResponse> {
    try {
      switch (config.provider) {
        case AIProvider.OPENAI:
          return await this.sendToOpenAI(message, history, options);
        case AIProvider.CLAUDE:
          return await this.sendToClaude(message, history, options);
        case AIProvider.GEMINI:
          return await this.sendToGemini(message, history, options);
        default:
          throw new Error(
            `Unsupported AI provider: ${String(config.provider)}`,
          );
      }
    } catch (error) {
      console.error('[AIServiceRouter] Error:', error);
      return {
        success: false,
        content: 'I encountered an error processing your request.',
        provider: config.provider,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async sendToOpenAI(
    message: string,
    history: ChatMessage[],
    options: AIRequestOptions,
  ): Promise<AIResponse> {
    if (!this.openaiService) {
      this.openaiService = new OpenAIService();
    }
    return await this.openaiService.sendMessage(message, history, options);
  }

  private async sendToClaude(
    message: string,
    history: ChatMessage[],
    options: AIRequestOptions,
  ): Promise<AIResponse> {
    // TODO: Implement Claude service
    return {
      success: false,
      content: 'Claude integration is not yet implemented.',
      provider: AIProvider.CLAUDE,
      error: 'Service not implemented',
    };
  }

  private async sendToGemini(
    message: string,
    history: ChatMessage[],
    options: AIRequestOptions,
  ): Promise<AIResponse> {
    // TODO: Implement Gemini service
    return {
      success: false,
      content: 'Gemini integration is not yet implemented.',
      provider: AIProvider.GEMINI,
      error: 'Service not implemented',
    };
  }

  async checkHealth(
    provider: AIProvider,
  ): Promise<{ success: boolean; message: string }> {
    try {
      switch (provider) {
        case AIProvider.OPENAI:
          if (!this.openaiService) {
            this.openaiService = new OpenAIService();
          }
          return await this.openaiService.checkHealth();
        case AIProvider.CLAUDE:
          return {
            success: false,
            message: 'Claude service not implemented',
          };
        case AIProvider.GEMINI:
          return {
            success: false,
            message: 'Gemini service not implemented',
          };
        default:
          return {
            success: false,
            message: `Unknown provider: ${String(provider)}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

import type { IAIService } from "../interfaces/IAIService";
import type { ChatMessage, StreamChunk, BaseAIConfig, AIServiceError } from "../interfaces/types";
import { ConversationTone, AIProvider } from "../enums/AIProvider";
import { ApiKeySecurity } from "../../../utils/apiKeySecurity";

/**
 * Base abstract class for AI services
 */
export abstract class BaseAIService implements IAIService {
  protected config: Required<BaseAIConfig>;
  protected abstract provider: AIProvider;

  constructor(config: BaseAIConfig) {
    this.config = {
      maxTokens: 4000,
      temperature: 0.7,
      tone: ConversationTone.FRIENDLY,
      ...config,
    };
  }

  abstract sendMessage(
    message: string,
    conversationHistory?: ChatMessage[],
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<string>;

  abstract validateApiKey(apiKey: string): boolean;

  abstract getProviderName(): string;

  /**
   * Get the system message based on the configured tone
   */
  getSystemMessage(): string {
    const toneMessages = {
      [ConversationTone.PROFESSIONAL]:
        "You are a professional AI assistant. Provide clear, formal, and well-structured responses with accuracy and professionalism.",
      [ConversationTone.FRIENDLY]:
        "You are a friendly and helpful AI assistant. Be warm, conversational, and supportive in your responses while maintaining helpfulness.",
      [ConversationTone.CASUAL]:
        "You are a casual and relaxed AI assistant. Be informal, easy-going, and conversational while still being helpful and informative.",
      [ConversationTone.CREATIVE]:
        "You are a creative and imaginative AI assistant. Think outside the box, provide innovative ideas, and bring creativity to your responses.",
      [ConversationTone.ANALYTICAL]:
        "You are an analytical and detail-oriented AI assistant. Focus on data, logic, thorough analysis, and well-reasoned responses.",
    };

    return toneMessages[this.config.tone];
  }

  /**
   * Get the deobfuscated API key
   */
  protected getDeobfuscatedApiKey(): string {
    const deobfuscatedApiKey = ApiKeySecurity.deobfuscate(this.config.apiKey);
    
    if (!deobfuscatedApiKey) {
      throw this.createError("Invalid API key", 401);
    }

    return deobfuscatedApiKey;
  }

  /**
   * Generate a unique message ID
   */
  protected generateMessageId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a provider-specific error
   */
  protected createError(message: string, statusCode?: number, originalError?: unknown): AIServiceError {
    const error = new Error(message) as AIServiceError;
    error.provider = this.provider;
    error.statusCode = statusCode;
    error.originalError = originalError;
    return error;
  }

  /**
   * Handle fetch response errors
   */
  protected async handleFetchError(response: Response): Promise<never> {
    const errorText = await response.text();
    let errorMessage = `${this.getProviderName()} API Error: ${response.status} ${response.statusText}`;

    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error?.message) {
        errorMessage = errorData.error.message;
      }
    } catch {
      // Use the generic error message
    }

    throw this.createError(errorMessage, response.status);
  }

  /**
   * Parse stream chunk line
   */
  protected parseStreamLine(line: string): string | null {
    if (line.startsWith("data: ")) {
      return line.slice(6);
    }
    return null;
  }

  /**
   * Handle stream reading
   */
  protected async handleStream(
    response: Response,
    onChunk: (chunk: StreamChunk) => void,
    parseChunk: (data: string) => string | null
  ): Promise<string> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    const messageId = this.generateMessageId();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onChunk({ messageId, chunk: "", isFinal: true });
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          const data = this.parseStreamLine(line);
          if (!data) continue;

          if (data === "[DONE]") {
            onChunk({ messageId, chunk: "", isFinal: true });
            return fullResponse;
          }

          try {
            const content = parseChunk(data);
            if (content) {
              fullResponse += content;
              onChunk({ messageId, chunk: content, isFinal: false });
            }
          } catch (parseError) {
            console.warn(`Failed to parse ${this.getProviderName()} stream chunk:`, parseError);
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullResponse;
  }
}

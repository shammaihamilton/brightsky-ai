import { BaseAIService } from "../base/BaseAIService";
import type { ChatMessage, StreamChunk, BaseAIConfig } from "../interfaces/types";
import { AIProvider } from "../enums/AIProvider";

/**
 * OpenAI service implementation
 */
export class OpenAIService extends BaseAIService {
  protected provider = AIProvider.OPENAI;

  constructor(config: BaseAIConfig) {
    super(config);
  }

  getProviderName(): string {
    return "OpenAI";
  }

  validateApiKey(apiKey: string): boolean {
    // OpenAI API keys typically start with 'sk-' and are 51 characters long
    return /^sk-[a-zA-Z0-9]{48}$/.test(apiKey);
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<string> {
    try {
      const apiKey = this.getDeobfuscatedApiKey();

      const messages: ChatMessage[] = [
        {
          role: "system",
          content: this.getSystemMessage(),
        },
        ...conversationHistory.slice(-10), 
        {
          role: "user",
          content: message,
        },
      ];

      const payload = {
        model: "gpt-4",
        messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
        stream: !!onChunk,
      };
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        await this.handleFetchError(response);
      }

      if (onChunk && response.body) {
        return await this.handleOpenAIStream(response, onChunk);
      } else {
        const data = await response.json();
        return data.choices[0]?.message?.content || "No response received";
      }
    } catch (error) {
      console.error("OpenAI Service Error:", error);
      throw error;
    }
  }

  private async handleOpenAIStream(
    response: Response,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<string> {
    return this.handleStream(response, onChunk, (data: string) => {
      const parsed = JSON.parse(data);
      return parsed.choices[0]?.delta?.content || null;
    });
  }
}

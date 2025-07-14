import { BaseAIService } from "../base/BaseAIService";
import type {
  ChatMessage,
  StreamChunk,
  BaseAIConfig,
} from "../interfaces/types";
import { AIProvider } from "../enums/AIProvider";

/**
 * Claude service implementation
 */
export class ClaudeService extends BaseAIService {
  protected provider = AIProvider.CLAUDE;

  constructor(config: BaseAIConfig) {
    super(config);
  }

  getProviderName(): string {
    return "Claude";
  }

  validateApiKey(apiKey: string): boolean {
    // Claude API keys typically start with 'sk-ant-' and are longer
    return /^sk-ant-[a-zA-Z0-9_-]+$/.test(apiKey);
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    onChunk?: (chunk: StreamChunk) => void,
  ): Promise<string> {
    try {
      const apiKey = this.getDeobfuscatedApiKey();

      const messages = conversationHistory
        .slice(-10)
        .filter((msg) => msg.role !== "system")
        .concat([{ role: "user", content: message }]);

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: Math.min(this.config.maxTokens, 4096),
          messages,
          system: this.getSystemMessage(),
          stream: !!onChunk,
        }),
      });

      if (!response.ok) {
        await this.handleFetchError(response);
      }

      if (onChunk && response.body) {
        return await this.handleClaudeStream(response, onChunk);
      } else {
        const data = await response.json();
        return data.content[0]?.text || "No response received";
      }
    } catch (error) {
      console.error("Claude Service Error:", error);
      throw error;
    }
  }

  private async handleClaudeStream(
    response: Response,
    onChunk: (chunk: StreamChunk) => void,
  ): Promise<string> {
    return this.handleStream(response, onChunk, (data: string) => {
      const parsed = JSON.parse(data);
      if (parsed.type === "content_block_delta" && parsed.delta?.text) {
        return parsed.delta.text;
      }
      return null;
    });
  }
}

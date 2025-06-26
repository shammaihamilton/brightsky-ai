import { BaseAIService } from "../base/BaseAIService";
import type { ChatMessage, StreamChunk, BaseAIConfig } from "../interfaces/types";
import { AIProvider } from "../enums/AIProvider";

/**
 * Gemini service implementation
 */
export class GeminiService extends BaseAIService {
  protected provider = AIProvider.GEMINI;

  constructor(config: BaseAIConfig) {
    super(config);
  }

  getProviderName(): string {
    return "Gemini";
  }

  validateApiKey(apiKey: string): boolean {
    // Gemini API keys are typically 39 characters long and alphanumeric
    return /^[a-zA-Z0-9_-]{35,45}$/.test(apiKey);
  }

  async sendMessage(
    message: string,
    conversationHistory: ChatMessage[] = [],
    onChunk?: (chunk: StreamChunk) => void
  ): Promise<string> {
    try {
      const apiKey = this.getDeobfuscatedApiKey();

      const contents = [
        ...conversationHistory
          .slice(-10)
          .filter((msg) => msg.role !== "system")
          .map((msg) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          })),
        {
          role: "user",
          parts: [{ text: message }],
        },
      ];

      const streamParam = onChunk ? "?alt=sse" : "";
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent${streamParam}&key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: this.config.maxTokens,
              temperature: this.config.temperature,
            },
            systemInstruction: {
              parts: [
                {
                  text: this.getSystemMessage(),
                },
              ],
            },
          }),
        }
      );

      if (!response.ok) {
        await this.handleFetchError(response);
      }

      if (onChunk && response.body) {
        return await this.handleGeminiStream(response, onChunk);
      } else {
        const data = await response.json();
        return (
          data.candidates[0]?.content?.parts[0]?.text || "No response received"
        );
      }
    } catch (error) {
      console.error("Gemini Service Error:", error);
      throw error;
    }
  }

  private async handleGeminiStream(
    response: Response,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<string> {
    return this.handleStream(response, onChunk, (data: string) => {
      const parsed = JSON.parse(data);
      return parsed.candidates?.[0]?.content?.parts?.[0]?.text || null;
    });
  }
}

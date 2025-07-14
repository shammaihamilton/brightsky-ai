import type { ChatMessage } from "../../ai/interfaces/types";
import type { IAIService } from "../../ai/interfaces/IAIService";
import type { ResponseProcessor } from "./ResponseProcessor";
import { WeatherResponseProcessor } from "./WeatherResponseProcessor";

interface ToolResult<T = unknown> {
  success: boolean;
  data: { results: T };
  error?: string;
}

export class ResponseProcessorRegistry {
  private processors: Map<string, ResponseProcessor> = new Map();

  constructor(private aiService: IAIService) {
    this.initializeProcessors();
  }

  private initializeProcessors(): void {
    // Register weather processor
    const weatherProcessor = new WeatherResponseProcessor(this.aiService);
    this.processors.set("weather", weatherProcessor);
    this.processors.set("weather_tool", weatherProcessor);
  }

  async processToolResult(
    toolName: string,
    toolResult: ToolResult,
    originalMessage: string,
    history: ChatMessage[],
  ): Promise<string> {
    const processor = this.processors.get(toolName);

    if (processor) {
      return processor.processResult(toolResult, originalMessage, history);
    }

    // Generic processor for unknown tools
    return this.processGenericResult(toolResult);
  }

  private processGenericResult(toolResult: ToolResult): string {
    try {
      const results = toolResult.data.results;

      // Handle different result types
      if (typeof results === "string") {
        return results;
      }

      if (typeof results === "object" && results !== null) {
        return JSON.stringify(results, null, 2);
      }

      return String(results);
    } catch (error) {
      console.error(
        "[ResponseProcessorRegistry] Error formatting generic result:",
        error,
      );
      return `Tool executed successfully but results couldn't be formatted properly.`;
    }
  }
}

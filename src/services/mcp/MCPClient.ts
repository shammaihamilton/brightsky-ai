// MCPClientAIService.ts
import type { IAIService } from "../ai/interfaces/IAIService";
import type { ChatMessage } from "../ai/interfaces/types";

interface WeatherResult {
  location?: string;
  temperature?: number;
  condition?: number;
  time?: number;
  windspeed?: number;
  description?: string;
}

interface ToolResult<T = unknown> {
  success: boolean;
  data: {
    results: T;
  };
  error?: string;
}

export class MCPClient implements IAIService {
  constructor(private primaryAI: IAIService) {}

  async sendMessage(message: string, history: ChatMessage[]): Promise<string> {
    try {
      // Build enhanced tool prompt with better instructions
      const toolPrompt = this.buildToolPrompt();
      const fullPrompt = `${toolPrompt}\nUser: ${message}`;

      // Get initial AI response
      let aiResponse = await this.primaryAI.sendMessage(fullPrompt, history);

      // Check if AI requested a tool
      const toolRequest = this.parseToolRequest(aiResponse);

      if (toolRequest) {
        const { toolName, query } = toolRequest;
        // Always call backend MCP endpoint for tool execution
        console.log(
          "[MCPClient] Sending tool request to backend:",
          toolName,
          query
        );
        // For weather, use ToolResult<WeatherResult>, otherwise ToolResult
        let toolResult: ToolResult;
        if (toolName === "weather" || toolName === "weather_tool") {
          toolResult = (await fetch("http://localhost:3001/mcp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tool: toolName, query }),
          }).then((res) => res.json())) as ToolResult<WeatherResult>;
        } else {
          toolResult = (await fetch("http://localhost:3001/mcp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tool: toolName, query }),
          }).then((res) => res.json())) as ToolResult;
        }
        console.log(
          "[MCPClient] Received tool result from backend:",
          toolResult
        );
        aiResponse = await this.processToolResult(
          toolName,
          toolResult,
          message,
          history
        );
      }
      console.log("[MCPClient] Returning final response:", aiResponse);
      return aiResponse;
    } catch (error) {
      console.error("[MCPClient] Error in sendMessage:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return `I encountered an error while processing your request: ${errorMessage}`;
    }
  }

  private buildToolPrompt(): string {
    return `You are an assistant with access to various tools.\nIMPORTANT INSTRUCTIONS:\n- When you need to use a tool, respond ONLY in this format: [TOOL: weather, query: location_name]\n- For weather queries, extract ONLY the location name (e.g., "Israel", "New York", "London")\n- Use weather tool for weather-related queries\n- Do NOT answer directly if a tool is available and needed for the user's request\n- If you do not need a tool, answer normally without using the [TOOL:] format`;
  }

  private parseToolRequest(
    response: string
  ): { toolName: string; query: string } | null {
    const toolMatch = response.match(
      /\[TOOL:\s*([^,\]]+),\s*query:\s*([^\]]+)\]/i
    );

    if (toolMatch) {
      return {
        toolName: toolMatch[1].trim(),
        query: toolMatch[2].trim(),
      };
    }

    return null;
  }

  private async processToolResult(
    toolName: string,
    toolResult: ToolResult,
    originalMessage: string,
    history: ChatMessage[]
  ): Promise<string> {
    if (!toolResult.success) {
      return `I tried to use the ${toolName} tool but encountered an error: ${toolResult.error}`;
    }
    if (toolName === "weather" || toolName === "weather_tool") {
      return this.processWeatherResult(
        toolResult as ToolResult<WeatherResult>,
        originalMessage,
        history
      );
    }
    return this.processGenericResult(toolResult);
  }

  private async processWeatherResult(
    toolResult: ToolResult<WeatherResult>,
    originalMessage: string,
    history: ChatMessage[]
  ): Promise<string> {
    const weather = toolResult.data.results;
    const resultPrompt = `The user asked: ${originalMessage}\n\nHere is the current, real-time weather information for the user's location:\n- Location: ${
      weather.location || "Unknown"
    }\n- Temperature: ${
      weather.temperature || "N/A"
    }°C\n- Weather condition code: ${
      weather.condition || "N/A"
    }\n- Description: ${weather.description || "N/A"}\n- Windspeed: ${
      weather.windspeed || "N/A"
    }\n- Time: ${
      weather.time || "N/A"
    } \n\nIMPORTANT:\n- Use ONLY the data above to answer the user's question about the weather.\n- Do NOT say you can't access real-time data or that you don't have access to current weather if there was a tool provided.\n- Do NOT use [TOOL:] format in your answer.\n- Respond as a helpful weather assistant, giving a natural, conversational summary of the weather for the user using all the data above and explaining each parameter.`;

    try {
      const response = await this.primaryAI.sendMessage(resultPrompt, history);
      if (
        /\[TOOL:/i.test(response) ||
        /I don't have real-time capabilities|I can't provide current weather|I do not have access to real-time weather|I am unable to provide current weather/i.test(
          response
        )
      ) {
        return `The current weather for ${
          weather.location || "the requested location"
        } is ${weather.temperature || "N/A"}°C with condition code ${
          weather.condition || "N/A"
        }.`;
      }
      return response;
    } catch (error) {
      console.error(
        "[ClientAIService] Error processing weather result:",
        error
      );
      return `The current weather for ${
        weather.location || "the requested location"
      } is ${weather.temperature || "N/A"}°C.`;
    }
  }

  private processGenericResult(toolResult: ToolResult): string {
    try {
      return JSON.stringify(toolResult.data.results, null, 2);
    } catch {
      return `Tool executed successfully but results couldn't be formatted: ${String(
        toolResult.data.results
      )}`;
    }
  }

  getSystemMessage(): string {
    return "Client AI Service with enhanced tool integration";
  }

  validateApiKey(apiKey: string): boolean {
    return this.primaryAI.validateApiKey(apiKey);
  }

  getProviderName(): string {
    return "Client MCP AI Service";
  }
}

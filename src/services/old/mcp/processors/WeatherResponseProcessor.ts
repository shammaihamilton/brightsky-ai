import type { ChatMessage } from "../../ai/interfaces/types";
import type { IAIService } from "../../ai/interfaces/IAIService";
import type { ResponseProcessor } from "./ResponseProcessor";

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
  data: { results: T };
  error?: string;
}

export class WeatherResponseProcessor implements ResponseProcessor {
  constructor(private aiService: IAIService) {}

  async processResult(
    toolResult: ToolResult,
    originalMessage: string,
    history: ChatMessage[],
  ): Promise<string> {
    const weather = (toolResult as ToolResult<WeatherResult>).data.results;

    // Validate weather data
    if (!weather || !weather.location) {
      return "I received weather data but it seems incomplete. Please try asking for weather information again.";
    }

    const resultPrompt = this.buildWeatherPrompt(weather, originalMessage);

    try {
      const response = await this.aiService.sendMessage(resultPrompt, history);

      // Check if AI is still refusing to use the data
      if (this.isAIRefusingData(response)) {
        return this.createFallbackResponse(weather);
      }

      return response;
    } catch (error) {
      console.error(
        "[WeatherResponseProcessor] Error processing weather result:",
        error,
      );
      return this.createFallbackResponse(weather);
    }
  }

  private buildWeatherPrompt(
    weather: WeatherResult,
    originalMessage: string,
  ): string {
    return `The user asked: ${originalMessage}

Here is the current, real-time weather information for the user's location:
- Location: ${weather.location}
- Temperature: ${weather.temperature || "N/A"}°C
- Weather condition code: ${weather.condition || "N/A"}
- Description: ${weather.description || "N/A"}
- Windspeed: ${weather.windspeed || "N/A"} km/h
- Time: ${weather.time || "N/A"}

IMPORTANT:
- Use ONLY the data above to answer the user's question about the weather.
- Do NOT say you can't access real-time data or that you don't have access to current weather.
- Do NOT use [TOOL:] format in your answer.
- Respond as a helpful weather assistant, giving a natural, conversational summary of the weather.`;
  }

  private isAIRefusingData(response: string): boolean {
    return (
      /\[TOOL:/i.test(response) ||
      /I don't have real-time capabilities|I can't provide current weather|I do not have access to real-time weather|I am unable to provide current weather/i.test(
        response,
      )
    );
  }

  private createFallbackResponse(weather: WeatherResult): string {
    const location = weather.location || "the requested location";
    const temp = weather.temperature ? `${weather.temperature}°C` : "N/A";
    const description = weather.description || "N/A";
    const windspeed = weather.windspeed ? `${weather.windspeed} km/h` : "N/A";

    return `The current weather for ${location} is ${temp}${description !== "N/A" ? ` with ${description.toLowerCase()}` : ""}. Wind speed is ${windspeed}.`;
  }
}

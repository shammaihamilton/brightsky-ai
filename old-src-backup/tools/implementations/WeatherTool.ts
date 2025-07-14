import { Injectable } from '@nestjs/common';
import { BaseTool, ToolResult } from '../registry/ToolRegistry';

@Injectable()
export class WeatherTool implements BaseTool {
  name = 'weather';
  description = 'Get current weather information for a location';
  aliases = ['weather', 'temperature', 'forecast'];

  async execute(query: string): Promise<ToolResult> {
    try {
      // This is a mock implementation - in real world, you'd call weather API
      const location = this.extractLocation(query);

      // Mock weather data
      const weatherData = {
        location,
        temperature: '22°C',
        conditions: 'Sunny',
        humidity: '65%',
        windSpeed: '10 km/h',
        forecast: 'Clear skies for the next 3 days',
      };

      return {
        success: true,
        data: {
          weather: weatherData,
          source: 'Mock Weather API',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        data: {},
      };
    }
  }

  async canHandle(message: string): Promise<boolean> {
    const weatherKeywords = [
      'weather',
      'temperature',
      'forecast',
      'rain',
      'sunny',
      'cloudy',
      'hot',
      'cold',
      'humid',
      'wind',
    ];

    const lowerMessage = message.toLowerCase();
    return weatherKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  private extractLocation(query: string): string {
    // Simple location extraction - in real world, you'd use NLP
    const locationRegex = /(?:in|at|for)\s+([a-zA-Z\s]+)/i;
    const match = query.match(locationRegex);
    return match ? match[1].trim() : 'Current Location';
  }
}

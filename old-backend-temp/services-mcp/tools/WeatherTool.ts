import {
  MCPTool,
  ToolCategory,
  ToolResult,
  ToolSchema,
} from '../interfaces/MCPTool';

export class WeatherTool implements MCPTool {
  name = 'weather';
  description = 'Get current weather conditions and forecasts for any location';
  category = ToolCategory.API;

  async canHandle(message: string): Promise<boolean> {
    const weatherKeywords = [
      'weather',
      'temperature',
      'rain',
      'snow',
      'sunny',
      'cloudy',
      'forecast',
      'humidity',
      'wind',
      'storm',
      'climate',
      'hot',
      'cold',
      'warm',
      'cool',
      'degrees',
      'celsius',
      'fahrenheit',
      'precipitation',
    ];

    const lowerMessage = message.toLowerCase();
    return weatherKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  async execute(
    message: string,
    context?: Record<string, unknown>,
  ): Promise<ToolResult> {
    try {
      // Extract location from message
      const location = this.extractLocation(message);

      if (!location) {
        return {
          success: false,
          data: {},
          error:
            'Could not determine location from message. Please specify a city or location.',
        };
      }

      // Mock weather data - replace with actual weather API integration
      const weatherData = this.getMockWeatherData(location);

      return {
        success: true,
        data: {
          location,
          weather: weatherData,
          query: message,
          source: 'weather_api',
        },
      };
    } catch (error) {
      return {
        success: false,
        data: {},
        error: `Weather service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private extractLocation(message: string): string | null {
    // Simple location extraction - can be enhanced with NLP
    const locationPatterns = [
      /weather in ([^?.,!]+)/i,
      /forecast for ([^?.,!]+)/i,
      /temperature in ([^?.,!]+)/i,
      /how's the weather in ([^?.,!]+)/i,
      /what's the weather like in ([^?.,!]+)/i,
    ];

    for (const pattern of locationPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Check for common city names
    const cities = [
      'new york',
      'london',
      'tokyo',
      'paris',
      'sydney',
      'toronto',
      'berlin',
      'moscow',
    ];
    const lowerMessage = message.toLowerCase();

    for (const city of cities) {
      if (lowerMessage.includes(city)) {
        return city;
      }
    }

    return null;
  }

  private getMockWeatherData(location: string) {
    // Mock weather data - replace with actual API call
    const mockData = {
      current: {
        temperature: Math.floor(Math.random() * 30) + 10, // 10-40°C
        condition: ['sunny', 'cloudy', 'rainy', 'partly cloudy'][
          Math.floor(Math.random() * 4)
        ],
        humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
        windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][
          Math.floor(Math.random() * 8)
        ],
      },
      forecast: [
        {
          day: 'Today',
          high: Math.floor(Math.random() * 30) + 15,
          low: Math.floor(Math.random() * 15) + 5,
          condition: 'sunny',
        },
        {
          day: 'Tomorrow',
          high: Math.floor(Math.random() * 30) + 15,
          low: Math.floor(Math.random() * 15) + 5,
          condition: 'partly cloudy',
        },
        {
          day: 'Day after',
          high: Math.floor(Math.random() * 30) + 15,
          low: Math.floor(Math.random() * 15) + 5,
          condition: 'rainy',
        },
      ],
      lastUpdated: new Date().toISOString(),
    };

    return mockData;
  }

  getSchema(): ToolSchema {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'The city or location to get weather for',
          },
          type: {
            type: 'string',
            enum: ['current', 'forecast', 'both'],
            description: 'Type of weather information to retrieve',
          },
        },
        required: ['location'],
      },
    };
  }
}

// mcp-chat.service.ts - Enhanced chat service with MCP
import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';
import axios from 'axios';

interface GeocodingResult {
  results: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  }>;
}

@Injectable()
export class McpService {
  constructor(private readonly weatherService: WeatherService) {}

  async handleTool(tool: string, query: string): Promise<any> {
    if (tool === 'weather' || tool === 'weather_tool') {
      try {
        const weatherData = await this.weatherService.getWeather(query);
        const geoResult = await this.getLocationName(query);

        // Format the response to match the structure the frontend expects
        return {
          success: true,
          data: {
            results: {
              location: geoResult.location,
              temperature: weatherData.current_weather?.temperature,
              condition: weatherData.current_weather?.weathercode,
              windspeed: weatherData.current_weather?.windspeed,
              time: weatherData.current_weather?.time,
              description: this.getWeatherDescription(
                weatherData.current_weather?.weathercode,
              ),
            },
          },
        };
      } catch (error: any) {
        const errorMessage =
          error && typeof error === 'object' && 'message' in error
            ? (error as Error).message
            : 'Unknown error';
        return {
          success: false,
          error: errorMessage,
          data: { results: {} },
        };
      }
    }

    // Handle unknown tools gracefully
    return {
      success: false,
      error: `Unknown tool: ${tool}`,
      data: { results: {} },
    };
  }

  private getWeatherDescription(weathercode: number): string {
    const codeMap: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };
    return codeMap[weathercode] || 'Unknown condition';
  }

  private async getLocationName(query: string): Promise<{ location: string }> {
    try {
      // Clean up the location query - extract just the location name
      const cleanLocation = query
        .replace(
          /\b(current|weather|forecast|temperature|in|for|at|the|what|is|whats)\b/gi,
          '',
        )
        .trim()
        .replace(/\s+/g, ' ');

      const location = cleanLocation || query;

      // Get geocoding result to get proper location name
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
      const geoResponse = await axios.get<GeocodingResult>(geoUrl);

      if (geoResponse.data.results && geoResponse.data.results.length > 0) {
        const result = geoResponse.data.results[0];
        return { location: `${result.name}, ${result.country}` };
      }

      return { location: location };
    } catch (error) {
      console.error('Geocoding error:', error);
      return { location: query };
    }
  }
}

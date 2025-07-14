import { Injectable } from '@nestjs/common';
import { BaseTool, ToolResult } from './base/BaseTool';
import { WeatherService } from '../../weather/weather.service';

interface WeatherResult {
  location: string;
  temperature: number;
  condition: number;
  windspeed: number;
  time: string;
  description: string;
}

@Injectable()
export class WeatherTool extends BaseTool {
  readonly name = 'weather';
  readonly description = 'Get current weather information for any location';
  readonly aliases = ['weather', 'weather_tool', 'forecast', 'temperature'];

  private readonly weatherCodeMap: { [key: number]: string } = {
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

  constructor(private readonly weatherService: WeatherService) {
    super();
  }

  canHandle(toolName: string): boolean {
    return this.aliases.includes(toolName.toLowerCase());
  }

  async execute(query: string): Promise<ToolResult<WeatherResult>> {
    try {
      const cleanLocation = this.cleanQuery(query, [
        'current',
        'weather',
        'forecast',
        'temperature',
      ]);

      const weatherData = await this.weatherService.getWeather(cleanLocation);
      const locationInfo =
        await this.weatherService.getLocationInfo(cleanLocation);

      const result: WeatherResult = {
        location: locationInfo.displayName,
        temperature: weatherData.current_weather?.temperature || 0,
        condition: weatherData.current_weather?.weathercode || 0,
        windspeed: weatherData.current_weather?.windspeed || 0,
        time: weatherData.current_weather?.time || '',
        description: this.getWeatherDescription(
          weatherData.current_weather?.weathercode,
        ),
      };

      return this.createSuccessResult(result);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Weather service error';
      return this.createErrorResult<WeatherResult>(errorMessage);
    }
  }

  private getWeatherDescription(weathercode: number | undefined): string {
    if (weathercode === undefined) {
      return 'Unknown condition';
    }
    return this.weatherCodeMap[weathercode] || 'Unknown condition';
  }
}

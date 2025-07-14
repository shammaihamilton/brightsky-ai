import { Injectable, Logger } from '@nestjs/common';
import { BaseTool } from './base/base.tool';
import { ParameterDefinition } from '../interfaces/tool.interface';
import axios from 'axios';

export interface WeatherParams {
  location: string;
  units?: string;
}

export interface WeatherResult {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  units: string;
  wind?: {
    speed: number;
    direction: string;
  };
  timestamp: string;
}

// Interface for the geocoding API response
interface GeocodingResult {
  results: Array<{
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  }>;
}

// Interface for the weather API response
interface WeatherApiData {
  current_weather: {
    temperature: number;
    weathercode: number;
    windspeed: number;
    winddirection: number;
    time: string;
  };
  current: {
    relative_humidity_2m: number;
  };
}

@Injectable()
export class WeatherTool extends BaseTool {
  private readonly logger = new Logger(WeatherTool.name);

  readonly name = 'weather';
  readonly description = 'Get current weather information for a location';
  readonly parameters: Record<string, ParameterDefinition> = {
    location: {
      type: 'string',
      description: 'The location to get weather for',
      required: true,
    },
    units: {
      type: 'string',
      description: 'Temperature units (celsius or fahrenheit)',
      enum: ['celsius', 'fahrenheit'],
      required: false,
    },
  };
  async execute(params: Record<string, unknown>): Promise<WeatherResult> {
    const { location, units = 'celsius' } = params as unknown as WeatherParams;

    this.logger.log(`Getting weather for ${location} in ${units}`);

    try {
      // Get coordinates for the location
      const coords = await this.getCoordinates(location);

      // Get weather data from Open-Meteo API
      const weatherData = await this.getWeatherData(coords, units);

      // Convert weather code to description
      const description = this.getWeatherDescription(
        weatherData.current_weather.weathercode,
      );

      // Temperature is already in the requested unit from the API
      const temperature = weatherData.current_weather.temperature;

      return {
        location,
        temperature: Math.round(temperature * 10) / 10, // Round to 1 decimal place
        description,
        humidity: weatherData.current?.relative_humidity_2m || 50,
        units,
        wind: {
          speed: Math.round(weatherData.current_weather.windspeed),
          direction: this.getWindDirection(
            weatherData.current_weather.winddirection,
          ),
        },
        timestamp: weatherData.current_weather.time,
      };
    } catch (error) {
      this.logger.error(`Weather API error for ${location}:`, error);
      throw new Error(
        `Failed to get weather data for ${location}: ${error.message}`,
      );
    }
  }

  private async getCoordinates(
    location: string,
  ): Promise<{ latitude: number; longitude: number }> {
    const cleanLocation = this.extractLocationFromQuery(location);
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanLocation)}&count=1`;

    const response = await axios.get<GeocodingResult>(geoUrl);

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error(`Location "${cleanLocation}" not found`);
    }

    const result = response.data.results[0];
    return {
      latitude: result.latitude,
      longitude: result.longitude,
    };
  }

  private async getWeatherData(
    coords: { latitude: number; longitude: number },
    units: string,
  ): Promise<WeatherApiData> {
    const temperatureUnit = units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true&current=relative_humidity_2m&temperature_unit=${temperatureUnit}`;

    const response = await axios.get<WeatherApiData>(weatherUrl);
    return response.data;
  }

  private extractLocationFromQuery(query: string): string {
    // Remove common weather-related words to extract just the location
    const cleanQuery = query
      .replace(
        /\b(current|weather|forecast|temperature|in|for|at|the|what|is|whats)\b/gi,
        '',
      )
      .trim()
      .replace(/\s+/g, ' '); // Replace multiple spaces with single space
    return cleanQuery || query; // Fallback to original if cleaning results in empty string
  }

  private getWeatherDescription(weatherCode: number): string {
    const weatherCodes: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail',
    };

    return weatherCodes[weatherCode] || 'Unknown weather condition';
  }

  private getWindDirection(degrees: number): string {
    const directions = [
      'N',
      'NNE',
      'NE',
      'ENE',
      'E',
      'ESE',
      'SE',
      'SSE',
      'S',
      'SSW',
      'SW',
      'WSW',
      'W',
      'WNW',
      'NW',
      'NNW',
    ];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  }
}

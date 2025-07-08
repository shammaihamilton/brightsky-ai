import { Injectable } from '@nestjs/common';
import axios from 'axios';

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
interface WeatherData {
  current_weather: {
    temperature: number;
    weathercode: number;
    windspeed: number;
    time: string;
  };
}

@Injectable()
export class WeatherService {
  async getWeather(location: string): Promise<WeatherData> {
    try {
      // Clean up the location query - extract just the location name
      const cleanLocation = this.extractLocationFromQuery(location);

      // 1. Geocode the location to get coordinates
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cleanLocation,
      )}&count=1`;
      const geoResponse = await axios.get<GeocodingResult>(geoUrl);

      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        throw new Error(`Location "${cleanLocation}" not found`);
      }

      const { latitude, longitude } = geoResponse.data.results[0];

      // 2. Get weather data using coordinates
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
      const weatherResponse = await axios.get<WeatherData>(weatherUrl);

      return weatherResponse.data;
    } catch (error) {
      console.error('Weather service error:', error);
      // Re-throw the error to be caught by the McpService
      throw error;
    }
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
}

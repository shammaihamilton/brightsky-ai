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

interface LocationInfo {
  displayName: string;
  coordinates: { latitude: number; longitude: number };
}

@Injectable()
export class WeatherService {
  async getWeather(location: string): Promise<WeatherData> {
    try {
      const cleanLocation = this.extractLocationFromQuery(location);
      const coords = await this.getCoordinates(cleanLocation);

      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current_weather=true`;
      const weatherResponse = await axios.get<WeatherData>(weatherUrl);

      return weatherResponse.data;
    } catch (error) {
      console.error('Weather service error:', error);
      throw error;
    }
  }

  async getLocationInfo(location: string): Promise<LocationInfo> {
    try {
      const cleanLocation = this.extractLocationFromQuery(location);
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        cleanLocation,
      )}&count=1`;
      const geoResponse = await axios.get<GeocodingResult>(geoUrl);

      if (!geoResponse.data.results || geoResponse.data.results.length === 0) {
        throw new Error(`Location "${cleanLocation}" not found`);
      }

      const result = geoResponse.data.results[0];
      return {
        displayName: `${result.name}, ${result.country}`,
        coordinates: {
          latitude: result.latitude,
          longitude: result.longitude,
        },
      };
    } catch (error) {
      console.error('Location info error:', error);
      throw error;
    }
  }

  private async getCoordinates(
    location: string,
  ): Promise<{ latitude: number; longitude: number }> {
    const locationInfo = await this.getLocationInfo(location);
    return locationInfo.coordinates;
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

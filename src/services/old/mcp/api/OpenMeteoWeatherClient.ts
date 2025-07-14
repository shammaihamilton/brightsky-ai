class OpenMeteoClient {
  async getWeather(location: string) {
    try {
      // 1. Geocode the location
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`;
      const geoRes = await fetch(geoUrl);
      if (!geoRes.ok) throw new Error("Geocoding API error");
      const geoData = await geoRes.json();
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("Location not found");
      }
      const {
        latitude: lat,
        longitude: lon,
        name: resolvedName,
        country,
      } = geoData.results[0];

      // 2. Fetch weather for the coordinates
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Weather API error");
      const data = await response.json();
      if (!data.current_weather) {
        throw new Error("No current weather data available");
      }
      return {
        location: `${resolvedName}, ${country}`,
        temperature: data.current_weather.temperature,
        condition: data.current_weather.weathercode,
        windspeed: data.current_weather.windspeed,
        time: data.current_weather.time,
        description: getWeatherDescription(data.current_weather.weathercode),
      };
    } catch (error) {
      console.error("[OpenMeteoClient] Error fetching weather:", error);
      throw error;
    }
  }
}

export default OpenMeteoClient;

function getWeatherDescription(weathercode: number): string {
  // Open-Meteo weather codes: https://open-meteo.com/en/docs#api_form
  const codeMap: { [key: number]: string } = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return codeMap[weathercode] ?? "Unknown weather condition";
}

import { Location, WeatherData } from '../types';

const API_KEY = import.meta.env.VITE_WEATHERAPI_KEY || 'demo_key';
const BASE_URL = 'https://api.weatherapi.com/v1';

export const searchLocations = async (query: string): Promise<Location[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(
      `${BASE_URL}/search.json?key=${API_KEY}&q=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search locations');
    }
    
    const data = await response.json();
    
    interface WeatherAPILocation {
      name: string;
      country: string;
      region: string;
      lat: number;
      lon: number;
    }

    return data.map((item: WeatherAPILocation) => ({
      name: item.name,
      country: item.country,
      state: item.region,
      lat: item.lat,
      lon: item.lon,
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    return [];
  }
};

export const getWeatherData = async (location: Location): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${location.lat},${location.lon}&days=7&aqi=yes&alerts=no`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const data = await response.json();
    
    
    
    const current = data.current;
    const locationData = data.location;
    const forecastDays = data.forecast.forecastday;
    const astro = forecastDays[0].astro;
    
    interface HourlyData {
      time: string;
      temp_c: number;
      condition: {
        text: string;
        icon: string;
      };
    }

    interface DayData {
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avghumidity: number;
        daily_chance_of_rain?: number;
        maxwind_kph: number;
        condition: {
          text: string;
          icon: string;
        };
      };
      hour: HourlyData[];
      astro: {
        sunrise: string;
        sunset: string;
        moonrise: string;
        moonset: string;
        moon_phase: string;
      };
    }

    // Get hourly data for next 24 hours
    const hourly: Array<{
      time: string;
      datetime: string;
      temp: number;
      description: string;
      icon: string;
    }> = [];
    const locationNow = new Date(locationData.localtime);
    
    forecastDays.forEach((day: DayData) => {
      day.hour.forEach((hour: HourlyData) => {
        const hourTime = new Date(hour.time);
        if (hourTime >= locationNow && hourly.length < 24) {
          hourly.push({
            time: hourTime.toLocaleTimeString('en-US', { 
              hour: 'numeric',
              hour12: true 
            }),
            datetime: hour.time, // Full datetime string for time-of-day calculation
            temp: Math.round(hour.temp_c),
            description: hour.condition.text,
            icon: hour.condition.icon,
          });
        }
      });
    });

    // Get daily forecast data
    const daily = forecastDays.map((day: DayData) => ({
      date: new Date(day.date).toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      tempHigh: Math.round(day.day.maxtemp_c),
      tempLow: Math.round(day.day.mintemp_c),
      description: day.day.condition.text,
      icon: day.day.condition.icon,
      humidity: day.day.avghumidity,
      chanceOfRain: day.day.daily_chance_of_rain || 0,
      windSpeed: Math.round(day.day.maxwind_kph),
    }));
    
    return {
      location: `${location.name}, ${location.country}`,
      current: {
        temp: Math.round(current.temp_c),
        feels_like: Math.round(current.feelslike_c),
        description: current.condition.text,
        icon: current.condition.icon,
        humidity: current.humidity,
        pressure: Math.round(current.pressure_mb),
        windSpeed: Math.round(current.wind_kph),
        windDirection: current.wind_dir,
        windDegree: current.wind_degree,
        airQuality: data.current.air_quality?.['us-epa-index'] || 0,
        uvIndex: current.uv,
        cloudCover: current.cloud,
        precipitation: current.precip_mm || 0,
        dewPoint: Math.round(current.dewpoint_c),
      },
      astronomy: {
        sunrise: astro.sunrise,
        sunset: astro.sunset,
        moonrise: astro.moonrise,
        moonset: astro.moonset,
        moonPhase: astro.moon_phase,
        localTime: locationData.localtime,
      },
      hourly,
      daily,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};
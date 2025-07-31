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
    
    return data.map((item: any) => ({
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
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${location.lat},${location.lon}&days=2&aqi=no&alerts=no`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    
    const data = await response.json();
    
    const current = data.current;
    const forecastDays = data.forecast.forecastday;
    
    // Get hourly data for next 24 hours
    const hourly: any[] = [];
    const now = new Date();
    
    forecastDays.forEach((day: any) => {
      day.hour.forEach((hour: any) => {
        const hourTime = new Date(hour.time);
        if (hourTime >= now && hourly.length < 24) {
          hourly.push({
            time: hourTime.toLocaleTimeString('en-US', { 
              hour: 'numeric',
              hour12: true 
            }),
            temp: Math.round(hour.temp_c),
            description: hour.condition.text,
            icon: hour.condition.icon,
          });
        }
      });
    });
    
    return {
      location: `${location.name}, ${location.country}`,
      current: {
        temp: Math.round(current.temp_c),
        feels_like: Math.round(current.feelslike_c),
        description: current.condition.text,
        icon: current.condition.icon,
      },
      hourly,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};
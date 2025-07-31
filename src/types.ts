export interface Location {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  location: string;
  current: {
    temp: number;
    feels_like: number;
    description: string;
    icon: string;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: string;
    windDegree: number;
    visibility: number;
    uvIndex: number;
    cloudCover: number;
    precipitation: number;
    dewPoint: number;
  };
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface HourlyWeather {
  time: string;
  temp: number;
  description: string;
  icon: string;
}

export interface DailyWeather {
  date: string;
  tempHigh: number;
  tempLow: number;
  description: string;
  icon: string;
  humidity: number;
  chanceOfRain: number;
  windSpeed: number;
}
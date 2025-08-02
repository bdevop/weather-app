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
    airQuality: number;
    uvIndex: number;
    cloudCover: number;
    precipitation: number;
    dewPoint: number;
  };
  astronomy: {
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    moonPhase: string;
    localTime: string;
  };
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface HourlyWeather {
  time: string;
  datetime: string;
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
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
  };
  hourly: HourlyWeather[];
}

export interface HourlyWeather {
  time: string;
  temp: number;
  description: string;
  icon: string;
}
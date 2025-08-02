import { describe, it, expect } from 'vitest';
import {
  getWeatherCondition,
  getTemperatureClass,
  getTimeOfDay,
  getWeatherIcon,
} from './weather';

describe('getWeatherCondition', () => {
  it('should return sunny for clear weather', () => {
    expect(getWeatherCondition('Clear')).toBe('sunny');
    expect(getWeatherCondition('Sunny')).toBe('sunny');
    expect(getWeatherCondition('clear sky')).toBe('sunny');
  });

  it('should return stormy for thunderstorm conditions', () => {
    expect(getWeatherCondition('Thunderstorm')).toBe('stormy');
    expect(getWeatherCondition('Lightning storm')).toBe('stormy');
    expect(getWeatherCondition('Heavy thunder')).toBe('stormy');
  });

  it('should return rainy for rain conditions', () => {
    expect(getWeatherCondition('Rain')).toBe('rainy');
    expect(getWeatherCondition('Light rain shower')).toBe('rainy');
    expect(getWeatherCondition('Drizzle')).toBe('rainy');
  });

  it('should return snowy for snow conditions', () => {
    expect(getWeatherCondition('Snow')).toBe('snowy');
    expect(getWeatherCondition('Blizzard')).toBe('snowy');
    expect(getWeatherCondition('Sleet')).toBe('snowy');
    expect(getWeatherCondition('Ice pellets')).toBe('snowy');
  });

  it('should return foggy for fog conditions', () => {
    expect(getWeatherCondition('Fog')).toBe('foggy');
    expect(getWeatherCondition('Mist')).toBe('foggy');
    expect(getWeatherCondition('Haze')).toBe('foggy');
  });

  it('should return cloudy for cloudy conditions', () => {
    expect(getWeatherCondition('Cloudy')).toBe('cloudy');
    expect(getWeatherCondition('Overcast')).toBe('cloudy');
    expect(getWeatherCondition('Partly cloudy')).toBe('cloudy');
  });

  it('should return cloudy as default for unknown conditions', () => {
    expect(getWeatherCondition('Unknown')).toBe('cloudy');
    expect(getWeatherCondition('')).toBe('cloudy');
  });
});

describe('getTemperatureClass', () => {
  it('should return correct temperature classes', () => {
    expect(getTemperatureClass(40)).toBe('temp-scorching');
    expect(getTemperatureClass(35)).toBe('temp-very-hot');
    expect(getTemperatureClass(28)).toBe('temp-hot');
    expect(getTemperatureClass(22)).toBe('temp-warm');
    expect(getTemperatureClass(18)).toBe('temp-pleasant');
    expect(getTemperatureClass(12)).toBe('temp-mild');
    expect(getTemperatureClass(6)).toBe('temp-cool');
    expect(getTemperatureClass(0)).toBe('temp-cold');
    expect(getTemperatureClass(-5)).toBe('temp-very-cold');
    expect(getTemperatureClass(-10)).toBe('temp-freezing');
  });

  it('should handle edge cases correctly', () => {
    expect(getTemperatureClass(38)).toBe('temp-scorching');
    expect(getTemperatureClass(37.9)).toBe('temp-very-hot');
    expect(getTemperatureClass(-1)).toBe('temp-cold');
    expect(getTemperatureClass(-0.5)).toBe('temp-cold');
  });
});

describe('getTimeOfDay', () => {
  it('should return dawn for sunrise period', () => {
    expect(getTimeOfDay('2024-01-01 06:00', '05:45 AM', '06:00 PM')).toBe('time-dawn');
    expect(getTimeOfDay('2024-01-01 05:30', '05:45 AM', '06:00 PM')).toBe('time-dawn');
  });

  it('should return day for daytime', () => {
    expect(getTimeOfDay('2024-01-01 12:00', '06:00 AM', '06:00 PM')).toBe('time-day');
    expect(getTimeOfDay('2024-01-01 15:00', '06:00 AM', '06:00 PM')).toBe('time-day');
  });

  it('should return dusk for sunset period', () => {
    expect(getTimeOfDay('2024-01-01 17:45', '06:00 AM', '06:00 PM')).toBe('time-dusk');
    expect(getTimeOfDay('2024-01-01 18:10', '06:00 AM', '06:00 PM')).toBe('time-dusk');
  });

  it('should return night for nighttime', () => {
    expect(getTimeOfDay('2024-01-01 22:00', '06:00 AM', '06:00 PM')).toBe('time-night');
    expect(getTimeOfDay('2024-01-01 03:00', '06:00 AM', '06:00 PM')).toBe('time-night');
  });

  it('should handle 12-hour format correctly', () => {
    expect(getTimeOfDay('2024-01-01 00:00', '12:00 AM', '12:00 PM')).toBe('time-night');
    expect(getTimeOfDay('2024-01-01 12:00', '12:00 AM', '12:00 PM')).toBe('time-day');
  });
});

describe('getWeatherIcon', () => {
  it('should return correct icons for clear conditions', () => {
    expect(getWeatherIcon('Clear', 'day/116.png')).toBe('☀️');
    expect(getWeatherIcon('Clear', 'night/116.png')).toBe('🌙');
    expect(getWeatherIcon('Sunny', 'day/113.png')).toBe('☀️');
  });

  it('should return correct icons for cloudy conditions', () => {
    expect(getWeatherIcon('Partly cloudy', 'day/116.png')).toBe('⛅');
    expect(getWeatherIcon('Partly cloudy', 'night/116.png')).toBe('☁️');
    expect(getWeatherIcon('Cloudy', 'day/119.png')).toBe('☁️');
    expect(getWeatherIcon('Overcast', 'day/122.png')).toBe('☁️');
  });

  it('should return correct icons for rain conditions', () => {
    expect(getWeatherIcon('Heavy rain', 'day/308.png')).toBe('🌧️');
    expect(getWeatherIcon('Light rain', 'day/296.png')).toBe('🌦️');
    expect(getWeatherIcon('Patchy rain', 'day/176.png')).toBe('🌦️');
    expect(getWeatherIcon('Drizzle', 'day/266.png')).toBe('🌦️');
  });

  it('should return correct icons for snow conditions', () => {
    expect(getWeatherIcon('Heavy snow', 'day/338.png')).toBe('🌨️');
    expect(getWeatherIcon('Light snow', 'day/326.png')).toBe('❄️');
    expect(getWeatherIcon('Blizzard', 'day/230.png')).toBe('🌨️');
    expect(getWeatherIcon('Sleet', 'day/320.png')).toBe('🧊');
  });

  it('should return correct icons for special conditions', () => {
    expect(getWeatherIcon('Thunderstorm', 'day/200.png')).toBe('⛈️');
    expect(getWeatherIcon('Fog', 'day/260.png')).toBe('🌫️');
    expect(getWeatherIcon('Mist', 'day/143.png')).toBe('🌫️');
    expect(getWeatherIcon('Hail', 'day/377.png')).toBe('🧊');
    expect(getWeatherIcon('Windy', 'day/wind.png')).toBe('💨');
  });

  it('should return default icons for unknown conditions', () => {
    expect(getWeatherIcon('Unknown', 'day/unknown.png')).toBe('🌤️');
    expect(getWeatherIcon('Unknown', 'night/unknown.png')).toBe('🌙');
  });
});
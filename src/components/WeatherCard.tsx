import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { WeatherData } from '../types';
import { getWeatherCondition, getTemperatureClass, getTimeOfDay, getForecastTimeOfDay, getWeatherIcon } from '../utils/weather';

export interface WeatherCardProps {
  weather: WeatherData;
  isPinned: boolean;
  onPin: () => void;
  onUnpin: () => void;
  onClose?: () => void;
  onDragHandle?: React.HTMLAttributes<HTMLElement>;
  formatTemperature: (tempC: number) => string;
  temperatureUnit: 'C' | 'F';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  forecastMode: 'hourly' | 'daily';
  onToggleForecastMode: () => void;
}

export const WeatherCard = React.memo(({ 
  weather, 
  isPinned, 
  onPin, 
  onUnpin, 
  onClose, 
  onDragHandle, 
  formatTemperature, 
  temperatureUnit, 
  isCollapsed, 
  onToggleCollapse, 
  forecastMode, 
  onToggleForecastMode 
}: WeatherCardProps) => {
  const getWindSpeed = (speedKph: number) => {
    if (temperatureUnit === 'F') {
      return `${Math.round(speedKph * 0.621371)} mph`;
    }
    return `${speedKph} km/h`;
  };

  const getAirQuality = (aqi: number) => {
    if (aqi === 1) return 'Good';
    if (aqi === 2) return 'Moderate';
    if (aqi === 3) return 'Unhealthy for Sensitive Groups';
    if (aqi === 4) return 'Unhealthy';
    if (aqi === 5) return 'Very Unhealthy';
    if (aqi === 6) return 'Hazardous';
    return 'Unknown';
  };

  const getPrecipitation = (precipMm: number) => {
    if (temperatureUnit === 'F') {
      return `${(precipMm * 0.0394).toFixed(2)} in`;
    }
    return `${precipMm} mm`;
  };

  const weatherCondition = getWeatherCondition(weather.current.description);
  const temperatureClass = getTemperatureClass(weather.current.temp);
  const timeOfDay = getTimeOfDay(weather.astronomy.localTime, weather.astronomy.sunrise, weather.astronomy.sunset);
  
  return (
    <div className={`weather-display ${isCollapsed ? 'collapsed-state' : ''} ${weatherCondition} ${timeOfDay}`}>
      {onClose && (
        <button 
          type="button"
          className="close-button-bubble"
          onClick={onClose}
          data-tooltip="Close"
          aria-label="Close weather card"
        >
          ✕
        </button>
      )}
      {onDragHandle && (
        <div 
          {...onDragHandle}
          className="drag-handle"
          data-tooltip="Drag to reorder"
          aria-label="Drag to reorder"
        >
          <div className="drag-dots">
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
            <span></span><span></span><span></span>
          </div>
        </div>
      )}
      <button 
        type="button"
        className={`pin-button ${isPinned ? 'pinned' : ''}`}
        onClick={isPinned ? onUnpin : onPin}
        data-tooltip={isPinned ? 'Unpin location' : 'Pin location'}
        aria-label={isPinned ? 'Unpin location' : 'Pin location'}
        aria-pressed={isPinned}
      >
        <div className="pin-icon"></div>
      </button>
      <button 
        type="button"
        className="collapse-toggle"
        onClick={onToggleCollapse}
        data-tooltip={isCollapsed ? 'Show details' : 'Hide details'}
        aria-label={isCollapsed ? 'Show details' : 'Hide details'}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? '+' : '−'}
      </button>
      <button 
        type="button"
        className="forecast-toggle"
        onClick={onToggleForecastMode}
        data-tooltip={`Switch to ${forecastMode === 'hourly' ? 'daily' : 'hourly'} forecast`}
        aria-label={`Switch to ${forecastMode === 'hourly' ? 'daily' : 'hourly'} forecast`}
      >
        {forecastMode === 'hourly' ? '7D' : '24H'}
      </button>
      <div className="weather-header">
        <div className="location-info">
          <h2 className="location-name">{weather.location}</h2>
          <div className="location-time">
            Local time: {new Date(weather.astronomy.localTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="weather-header-buttons">
        </div>
      </div>
      
      <div className="current-weather">
        <div className="weather-icon" aria-label={weather.current.description}>
          {getWeatherIcon(weather.current.description, weather.current.icon)}
        </div>
        <div className={`temperature ${temperatureClass}`}>
          {formatTemperature(weather.current.temp)}
        </div>
        <div className="weather-info">
          <div className="weather-description">{weather.current.description}</div>
          <div className="feels-like">Feels like {formatTemperature(weather.current.feels_like)}</div>
        </div>
      </div>

      <div className={`weather-metrics ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <div className="metrics-list">
          <div className="metric-item">
            <span className="metric-label">Sunrise</span>
            <span className="metric-value">{weather.astronomy.sunrise}</span>
          </div>
          
          <div className="metric-item">
            <span className="metric-label">Sunset</span>
            <span className="metric-value">{weather.astronomy.sunset}</span>
          </div>
          
          <div className="metric-item air-quality">
            <span className="metric-label">Air Quality</span>
            <span className="metric-value">{getAirQuality(weather.current.airQuality)}</span>
          </div>
          
          <div className="metric-item wind">
            <span className="metric-label">Wind</span>
            <span className="metric-value">{getWindSpeed(weather.current.windSpeed)} {weather.current.windDirection}</span>
          </div>
          
          <div className="metric-item humidity">
            <span className="metric-label">Humidity</span>
            <span className="metric-value">{weather.current.humidity}%</span>
          </div>
          
          <div className="metric-item pressure">
            <span className="metric-label">Cloud Cover</span>
            <span className="metric-value">{weather.current.cloudCover}%</span>
          </div>
          
          <div className="metric-item feels-like">
            <span className="metric-label">Precipitation</span>
            <span className="metric-value">{getPrecipitation(weather.current.precipitation)}</span>
          </div>
          
          <div className="metric-item uv">
            <span className="metric-label">UV Index</span>
            <span className="metric-value">{weather.current.uvIndex}</span>
          </div>
        </div>
      </div>

      <div className="forecast-section">
        {forecastMode === 'hourly' ? (
          <>
            <h3 className="forecast-title">24-Hour Forecast</h3>
            <div className="forecast-list" role="list">
              {weather.hourly.map((hour, index) => {
                const hourTimeOfDay = getForecastTimeOfDay(hour.datetime, weather.astronomy.sunrise, weather.astronomy.sunset);
                return (
                  <div key={index} className={`forecast-item ${getWeatherCondition(hour.description)} ${hourTimeOfDay}`} role="listitem">
                    <div className="forecast-time">{hour.time}</div>
                    <div className="forecast-icon" aria-label={hour.description}>
                      {getWeatherIcon(hour.description, hour.icon)}
                    </div>
                    <div className={`forecast-temp ${getTemperatureClass(hour.temp)}`}>
                      {formatTemperature(hour.temp)}
                    </div>
                    <div className="forecast-desc">{hour.description}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h3 className="forecast-title">7-Day Forecast</h3>
            <div className="forecast-list" role="list">
              {weather.daily.map((day, index) => (
                <div key={index} className={`forecast-item daily-item ${getWeatherCondition(day.description)}`} role="listitem">
                  <div className="forecast-time">{day.date}</div>
                  <div className="forecast-icon" aria-label={day.description}>
                    {getWeatherIcon(day.description, day.icon)}
                  </div>
                  <div className="forecast-temp-range">
                    <span className={`temp-high ${getTemperatureClass(day.tempHigh)}`}>
                      {formatTemperature(day.tempHigh)}
                    </span>
                    <span className={`temp-low ${getTemperatureClass(day.tempLow)}`}>
                      {formatTemperature(day.tempLow)}
                    </span>
                  </div>
                  <div className="forecast-desc">{day.description}</div>
                  <div className="daily-details">
                    <span aria-label={`${day.chanceOfRain}% chance of rain`}>💧 {day.chanceOfRain}%</span>
                    <span aria-label={`Wind speed ${temperatureUnit === 'F' ? Math.round(day.windSpeed * 0.621371) + ' mph' : day.windSpeed + ' km/h'}`}>
                      💨 {temperatureUnit === 'F' ? Math.round(day.windSpeed * 0.621371) + ' mph' : day.windSpeed + ' km/h'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

WeatherCard.displayName = 'WeatherCard';

export interface SortableWeatherCardProps extends WeatherCardProps {
  id: string;
}

export const SortableWeatherCard = (props: SortableWeatherCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <WeatherCard {...props} onDragHandle={listeners} />
    </div>
  );
};
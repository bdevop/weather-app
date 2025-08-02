import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Location, WeatherData } from './types';
import { searchLocations, getWeatherData } from './services/weatherApi';

const getWeatherCondition = (conditionText: string) => {
  const condition = conditionText.toLowerCase();
  
  if (condition.includes('clear') || condition.includes('sunny')) {
    return 'sunny';
  }
  if (condition.includes('thunder') || condition.includes('storm') || condition.includes('lightning')) {
    return 'stormy';
  }
  if (condition.includes('rain') || condition.includes('shower') || condition.includes('drizzle')) {
    return 'rainy';
  }
  if (condition.includes('snow') || condition.includes('blizzard') || condition.includes('sleet') || condition.includes('ice')) {
    return 'snowy';
  }
  if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
    return 'foggy';
  }
  if (condition.includes('cloudy') || condition.includes('overcast')) {
    return 'cloudy';
  }
  
  return 'cloudy'; // default
};

const getTemperatureClass = (tempC: number) => {
  if (tempC >= 38) return 'temp-scorching';    // 100°F+
  if (tempC >= 32) return 'temp-very-hot';     // 90-99°F
  if (tempC >= 27) return 'temp-hot';          // 80-89°F
  if (tempC >= 21) return 'temp-warm';         // 70-79°F
  if (tempC >= 16) return 'temp-pleasant';     // 60-69°F
  if (tempC >= 10) return 'temp-mild';         // 50-59°F
  if (tempC >= 4) return 'temp-cool';          // 40-49°F
  if (tempC >= -1) return 'temp-cold';         // 30-39°F
  if (tempC >= -7) return 'temp-very-cold';    // 20-29°F
  return 'temp-freezing';                      // <20°F
};

const getTimeOfDay = (localTime: string, sunrise: string, sunset: string) => {
  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minutes; // Convert to minutes since midnight
  };

  // Parse current time from localTime (format: "2024-01-01 14:30")
  const currentTime = new Date(localTime);
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  const sunriseMinutes = parseTime(sunrise);
  const sunsetMinutes = parseTime(sunset);
  
  // Define time periods (in minutes before/after sunrise/sunset)
  const dawnStart = sunriseMinutes - 30; // 30 min before sunrise
  const dawnEnd = sunriseMinutes + 15;   // 15 min after sunrise
  const duskStart = sunsetMinutes - 30;  // 30 min before sunset
  const duskEnd = sunsetMinutes + 15;    // 15 min after sunset
  
  if (currentMinutes >= dawnStart && currentMinutes <= dawnEnd) {
    return 'time-dawn';
  } else if (currentMinutes > dawnEnd && currentMinutes < duskStart) {
    return 'time-day';
  } else if (currentMinutes >= duskStart && currentMinutes <= duskEnd) {
    return 'time-dusk';
  } else {
    return 'time-night';
  }
};


const getForecastTimeOfDay = (hourDatetime: string, sunrise: string, sunset: string) => {
  // Parse the hour datetime (format: "2024-01-01 14:00")
  const hourTime = new Date(hourDatetime);
  const hourMinutes = hourTime.getHours() * 60 + hourTime.getMinutes();
  
  const parseTime = (timeStr: string) => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return hour24 * 60 + minutes;
  };
  
  const sunriseMinutes = parseTime(sunrise);
  const sunsetMinutes = parseTime(sunset);
  
  // Define time periods (same as main function)
  const dawnStart = sunriseMinutes - 30;
  const dawnEnd = sunriseMinutes + 15;
  const duskStart = sunsetMinutes - 30;
  const duskEnd = sunsetMinutes + 15;
  
  if (hourMinutes >= dawnStart && hourMinutes <= dawnEnd) {
    return 'time-dawn';
  } else if (hourMinutes > dawnEnd && hourMinutes < duskStart) {
    return 'time-day';
  } else if (hourMinutes >= duskStart && hourMinutes <= duskEnd) {
    return 'time-dusk';
  } else {
    return 'time-night';
  }
};

const getWeatherIcon = (conditionText: string, iconUrl: string) => {
  // WeatherAPI.com provides detailed condition text, let's use that for better accuracy
  const condition = conditionText.toLowerCase();
  const isNight = iconUrl.includes('/night/');
  
  // Clear conditions
  if (condition.includes('clear') || condition.includes('sunny')) {
    return isNight ? '🌙' : '☀️';
  }
  
  // Partly cloudy variations
  if (condition.includes('partly cloudy') || condition.includes('partly overcast')) {
    return isNight ? '☁️' : '⛅';
  }
  
  // Cloudy conditions
  if (condition.includes('cloudy') || condition.includes('overcast')) {
    return '☁️';
  }
  
  // Mist/Fog variations
  if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
    return '🌫️';
  }
  
  // Rain conditions (ordered from heaviest to lightest for better matching)
  if (condition.includes('heavy rain') || condition.includes('torrential') || condition.includes('moderate rain')) {
    return '🌧️';
  }
  if (condition.includes('patchy rain') || condition.includes('light rain') || condition.includes('drizzle')) {
    return '🌦️';
  }
  if (condition.includes('rain') || condition.includes('shower')) {
    return '🌧️';
  }
  
  // Thunder/Storm variations
  if (condition.includes('thunder') || condition.includes('storm') || condition.includes('lightning')) {
    return '⛈️';
  }
  
  // Snow conditions
  if (condition.includes('heavy snow') || condition.includes('blizzard')) {
    return '🌨️';
  }
  if (condition.includes('patchy snow') || condition.includes('light snow') || condition.includes('snow')) {
    return '❄️';
  }
  if (condition.includes('sleet') || condition.includes('ice pellets')) {
    return '🧊';
  }
  
  // Hail
  if (condition.includes('hail')) {
    return '🧊';
  }
  
  // Wind conditions
  if (condition.includes('windy') || condition.includes('gale') || condition.includes('breezy')) {
    return '💨';
  }
  
  // Freezing conditions
  if (condition.includes('freezing')) {
    return '🧊';
  }
  
  // Default fallback
  return isNight ? '🌙' : '🌤️';
};

interface WeatherCardProps {
  weather: WeatherData;
  isPinned: boolean;
  onPin: () => void;
  onUnpin: () => void;
  onClose?: () => void;
  onDragHandle?: any;
  formatTemperature: (tempC: number) => string;
  temperatureUnit: 'C' | 'F';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  forecastMode: 'hourly' | 'daily';
  onToggleForecastMode: () => void;
}

const WeatherCard = ({ weather, isPinned, onPin, onUnpin, onClose, onDragHandle, formatTemperature, temperatureUnit, isCollapsed, onToggleCollapse, forecastMode, onToggleForecastMode }: WeatherCardProps) => {
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
        >
          ✕
        </button>
      )}
      {onDragHandle && (
        <div 
          {...onDragHandle}
          className="drag-handle"
          data-tooltip="Drag to reorder"
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
      >
        <div className="pin-icon"></div>
      </button>
      <button 
        type="button"
        className="collapse-toggle"
        onClick={onToggleCollapse}
        data-tooltip={isCollapsed ? 'Show details' : 'Hide details'}
      >
        {isCollapsed ? '+' : '−'}
      </button>
      <button 
        type="button"
        className="forecast-toggle"
        onClick={onToggleForecastMode}
        data-tooltip={`Switch to ${forecastMode === 'hourly' ? 'daily' : 'hourly'} forecast`}
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
        <div className="weather-icon">{getWeatherIcon(weather.current.description, weather.current.icon)}</div>
        <div className={`temperature ${temperatureClass}`}>{formatTemperature(weather.current.temp)}</div>
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
            <div className="forecast-list">
              {weather.hourly.map((hour, index) => {
                const hourTimeOfDay = getForecastTimeOfDay(hour.datetime, weather.astronomy.sunrise, weather.astronomy.sunset);
                return (
                  <div key={index} className={`forecast-item ${getWeatherCondition(hour.description)} ${hourTimeOfDay}`}>
                    <div className="forecast-time">{hour.time}</div>
                    <div className="forecast-icon">{getWeatherIcon(hour.description, hour.icon)}</div>
                    <div className={`forecast-temp ${getTemperatureClass(hour.temp)}`}>{formatTemperature(hour.temp)}</div>
                    <div className="forecast-desc">{hour.description}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h3 className="forecast-title">7-Day Forecast</h3>
            <div className="forecast-list">
              {weather.daily.map((day, index) => (
                <div key={index} className={`forecast-item daily-item ${getWeatherCondition(day.description)}`}>
                  <div className="forecast-time">{day.date}</div>
                  <div className="forecast-icon">{getWeatherIcon(day.description, day.icon)}</div>
                  <div className="forecast-temp-range">
                    <span className={`temp-high ${getTemperatureClass(day.tempHigh)}`}>{formatTemperature(day.tempHigh)}</span>
                    <span className={`temp-low ${getTemperatureClass(day.tempLow)}`}>{formatTemperature(day.tempLow)}</span>
                  </div>
                  <div className="forecast-desc">{day.description}</div>
                  <div className="daily-details">
                    <span>💧 {day.chanceOfRain}%</span>
                    <span>💨 {temperatureUnit === 'F' ? Math.round(day.windSpeed * 0.621371) + ' mph' : day.windSpeed + ' km/h'}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface SortableWeatherCardProps extends WeatherCardProps {
  id: string;
}

const SortableWeatherCard = (props: SortableWeatherCardProps) => {
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

function App() {
  const isInitialLoad = useRef(true);
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPinning, setCurrentlyPinning] = useState<string | null>(null);
  const [needsSyncAfterPin, setNeedsSyncAfterPin] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('weather-app-theme');
    return (savedTheme as 'light' | 'dark') || 'dark';
  });
  const [pinnedLocations, setPinnedLocations] = useState<Location[]>(() => {
    const savedPinned = localStorage.getItem('weather-app-pinned');
    if (!savedPinned) return [];
    
    try {
      const parsed = JSON.parse(savedPinned);
      
      // Check if this is old weather data format (has 'current' property)
      if (parsed.length > 0 && parsed[0].current) {
        // Clear old format and start fresh
        localStorage.removeItem('weather-app-pinned');
        return [];
      }
      
      // Check if it's already in the correct location format
      if (parsed.length > 0 && parsed[0].name && parsed[0].country) {
        return parsed;
      }
      
      // Unknown format, clear it
      localStorage.removeItem('weather-app-pinned');
      return [];
    } catch (err) {
      console.error('Error parsing pinned locations:', err);
      localStorage.removeItem('weather-app-pinned');
      return [];
    }
  });
  const [pinnedWeatherData, setPinnedWeatherData] = useState<{[key: string]: WeatherData}>({});
  const [collapsedCards, setCollapsedCards] = useState<{[key: string]: boolean}>(() => {
    const savedCollapsed = localStorage.getItem('weather-app-collapsed');
    return savedCollapsed ? JSON.parse(savedCollapsed) : {};
  });
  const [forecastModes, setForecastModes] = useState<{[key: string]: 'hourly' | 'daily'}>(() => {
    const savedModes = localStorage.getItem('weather-app-forecast-modes');
    return savedModes ? JSON.parse(savedModes) : {};
  });
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>(() => {
    const savedUnit = localStorage.getItem('weather-app-temp-unit');
    return (savedUnit as 'C' | 'F') || 'F';
  });
  const [layoutMode, setLayoutMode] = useState<'stacked' | 'side-by-side'>(() => {
    const savedLayout = localStorage.getItem('weather-app-layout');
    return (savedLayout as 'stacked' | 'side-by-side') || 'stacked';
  });

  useEffect(() => {
    localStorage.setItem('weather-app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('weather-app-pinned', JSON.stringify(pinnedLocations));
  }, [pinnedLocations]);

  useEffect(() => {
    localStorage.setItem('weather-app-temp-unit', temperatureUnit);
  }, [temperatureUnit]);

  useEffect(() => {
    localStorage.setItem('weather-app-layout', layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    localStorage.setItem('weather-app-collapsed', JSON.stringify(collapsedCards));
  }, [collapsedCards]);

  useEffect(() => {
    localStorage.setItem('weather-app-forecast-modes', JSON.stringify(forecastModes));
  }, [forecastModes]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  const toggleLayoutMode = () => {
    setLayoutMode(prev => prev === 'stacked' ? 'side-by-side' : 'stacked');
  };

  const toggleCardCollapse = (location: string) => {
    setCollapsedCards(prev => ({
      ...prev,
      [location]: !(prev[location] ?? true)
    }));
  };

  const toggleForecastMode = (location: string) => {
    setForecastModes(prev => ({
      ...prev,
      [location]: prev[location] === 'daily' ? 'hourly' : 'daily'
    }));
  };

  const convertTemperature = (tempC: number, unit: 'C' | 'F') => {
    if (unit === 'F') {
      return Math.round((tempC * 9/5) + 32);
    }
    return tempC;
  };

  const formatTemperature = (tempC: number) => {
    return `${convertTemperature(tempC, temperatureUnit)}°${temperatureUnit}`;
  };

  const pinLocation = async () => {
    if (!currentLocation || !weather) return;
    
    const isAlreadyPinned = pinnedLocations.some(pinned => 
      pinned.name === currentLocation.name && pinned.country === currentLocation.country
    );
    
    if (!isAlreadyPinned) {
      const locationKey = `${currentLocation.name}, ${currentLocation.country}`;
      
      // Mark as currently being pinned to hide search result immediately
      setCurrentlyPinning(locationKey);
      
      // Add location to pinned list and weather data simultaneously
      setPinnedLocations([...pinnedLocations, currentLocation]);
      setPinnedWeatherData(prev => ({
        ...prev,
        [locationKey]: weather
      }));
      
      // Flag that we need to sync after this pin operation
      setNeedsSyncAfterPin(true);
    }
  };

  const unpinLocation = (location: string) => {
    setPinnedLocations(prev => prev.filter(pinned => 
      `${pinned.name}, ${pinned.country}` !== location
    ));
    // Also remove from weather data cache
    setPinnedWeatherData(prev => {
      const newData = { ...prev };
      delete newData[location];
      return newData;
    });
  };

  const isLocationPinned = (location: string) => {
    const isPinned = pinnedLocations.some(pinned => 
      `${pinned.name}, ${pinned.country}` === location
    );
    const isCurrentlyBeingPinned = currentlyPinning === location;
    return isPinned || isCurrentlyBeingPinned;
  };

  const closeSearchedLocation = () => {
    setWeather(null);
    setCurrentLocation(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const reversedItems = Array.from(pinnedLocations).reverse();
      const oldIndex = reversedItems.findIndex(location => 
        `${location.name}-${location.state || ''}-${location.country}` === active.id
      );
      const newIndex = reversedItems.findIndex(location => 
        `${location.name}-${location.state || ''}-${location.country}` === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedItems = arrayMove(reversedItems, oldIndex, newIndex);
        // Reverse back to normal order (newest first)
        const reorderedPinnedLocations = reorderedItems.reverse();
        setPinnedLocations(reorderedPinnedLocations);
      }
    }
  };


  const refreshWeatherData = async (manual = false, refreshCurrent = true) => {
    if (manual) {
      setRefreshing(true);
    }
    
    try {
      // Refresh current weather if available and requested
      if (currentLocation && refreshCurrent) {
        try {
          const weatherData = await getWeatherData(currentLocation);
          setWeather(weatherData);
        } catch (err) {
          console.error('Failed to refresh current weather:', err);
        }
      }

      // Refresh all pinned locations
      const refreshPromises = pinnedLocations.map(async (location) => {
        try {
          const weatherData = await getWeatherData(location);
          return { location: `${location.name}, ${location.country}`, weatherData };
        } catch (err) {
          console.error(`Failed to refresh weather for ${location.name}:`, err);
          return null;
        }
      });

      const results = await Promise.all(refreshPromises);
      const newPinnedWeatherData: {[key: string]: WeatherData} = {};
      
      results.forEach(result => {
        if (result) {
          newPinnedWeatherData[result.location] = result.weatherData;
        }
      });

      setPinnedWeatherData(newPinnedWeatherData);
      setLastRefresh(new Date());
    } finally {
      if (manual) setRefreshing(false);
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(async () => {
      if (query.trim()) {
        const results = await searchLocations(query);
        setLocations(results);
      } else {
        setLocations([]);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [query]);

  // Load weather data for pinned locations - only on initial load, not when adding new pins
  useEffect(() => {
    if (isInitialLoad.current && pinnedLocations.length > 0) {
      refreshWeatherData(false, false);
      isInitialLoad.current = false;
    }
  }, [pinnedLocations]);

  // Sync weather data after pinning a new location
  useEffect(() => {
    if (needsSyncAfterPin && !isInitialLoad.current) {
      refreshWeatherData(false, false).finally(() => {
        setCurrentlyPinning(null);
        setNeedsSyncAfterPin(false);
      });
    }
  }, [needsSyncAfterPin, pinnedLocations]);

  // Auto-refresh weather data every 10 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshWeatherData();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, []); // Empty dependency array to maintain consistent interval timing

  const handleLocationSelect = async (location: Location) => {
    setLoading(true);
    setError(null);
    setLocations([]);
    setQuery('');

    try {
      const weatherData = await getWeatherData(location);
      setWeather(weatherData);
      setCurrentLocation(location);
      
      // Refresh all pinned locations to sync timestamps with the new search
      refreshWeatherData(false, false);
    } catch (err) {
      setError('Failed to load weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header-left">
          <h1 className="app-title">
            <span className="title-main">Weather</span>
            <span className="title-accent">Peek</span>
          </h1>
          {lastRefresh && (
            <div className="last-refresh">
              Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        <div className="header-controls">
          <button 
            type="button"
            className="refresh-button" 
            onClick={() => refreshWeatherData(true)}
            disabled={refreshing}
            data-tooltip="Refresh weather data"
          >
            {refreshing ? '↻' : '↻'}
          </button>
          <button 
            type="button"
            className="temp-unit-toggle" 
            onClick={toggleTemperatureUnit}
            data-tooltip={`Switch to °${temperatureUnit === 'F' ? 'C' : 'F'}`}
          >
            °{temperatureUnit}
          </button>
          <button 
            type="button"
            className="layout-toggle" 
            onClick={toggleLayoutMode}
            data-tooltip={layoutMode === 'stacked' ? 'Switch to side-by-side layout' : 'Switch to stacked layout'}
          >
            {layoutMode === 'stacked' ? 'Grid' : 'Stack'}
          </button>
          <button 
            type="button"
            className="theme-toggle" 
            onClick={toggleTheme}
            data-tooltip={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search for a location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        
        {locations.length > 0 && (
          <div className="locations-list">
            {locations.map((location, index) => (
              <div
                key={index}
                className="location-item"
                onClick={() => handleLocationSelect(location)}
              >
                {location.name}, {location.state && `${location.state}, `}{location.country}
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="loading">Loading weather data...</div>}
      
      {error && <div className="error">{error}</div>}

      {weather && !loading && !isLocationPinned(weather.location) && (
        <div className="search-result-container">
          <WeatherCard
            weather={weather}
            isPinned={false}
            onPin={pinLocation}
            onUnpin={() => unpinLocation(weather.location)}
            onClose={closeSearchedLocation}
            formatTemperature={formatTemperature}
            temperatureUnit={temperatureUnit}
            isCollapsed={collapsedCards[weather.location] ?? true}
            onToggleCollapse={() => toggleCardCollapse(weather.location)}
            forecastMode={forecastModes[weather.location] || 'hourly'}
            onToggleForecastMode={() => toggleForecastMode(weather.location)}
          />
        </div>
      )}

      <div className={`weather-container ${layoutMode} ${Object.values(collapsedCards).some(collapsed => collapsed) ? 'has-collapsed-cards' : ''}`}>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={pinnedLocations.slice().reverse().map(location => 
              `${location.name}-${location.state || ''}-${location.country}`
            )}
            strategy={layoutMode === 'side-by-side' ? rectSortingStrategy : verticalListSortingStrategy}
          >
            <div className={`weather-droppable-area ${layoutMode} ${Object.values(collapsedCards).some(collapsed => collapsed) ? 'has-collapsed-cards' : ''}`}>
              {pinnedLocations.slice().reverse().map((location) => {
                const locationKey = `${location.name}, ${location.country}`;
                const weatherData = pinnedWeatherData[locationKey];
                const locationId = `${location.name}-${location.state || ''}-${location.country}`;
                
                if (!weatherData) {
                  return null;
                }
                
                return (
                  <SortableWeatherCard
                    key={locationId}
                    id={locationId}
                    weather={weatherData}
                    isPinned={true}
                    onPin={() => {}}
                    onUnpin={() => unpinLocation(locationKey)}
                    formatTemperature={formatTemperature}
                    temperatureUnit={temperatureUnit}
                    isCollapsed={collapsedCards[locationKey] ?? true}
                    onToggleCollapse={() => toggleCardCollapse(locationKey)}
                    forecastMode={forecastModes[locationKey] || 'hourly'}
                    onToggleForecastMode={() => toggleForecastMode(locationKey)}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

export default App;
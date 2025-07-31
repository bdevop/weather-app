import { useState, useEffect } from 'react';
import { Location, WeatherData } from './types';
import { searchLocations, getWeatherData } from './services/weatherApi';

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
  formatTemperature: (tempC: number) => string;
  temperatureUnit: 'C' | 'F';
}

const WeatherCard = ({ weather, isPinned, onPin, onUnpin, formatTemperature, temperatureUnit }: WeatherCardProps) => {
  const getWindSpeed = (speedKph: number) => {
    if (temperatureUnit === 'F') {
      return `${Math.round(speedKph * 0.621371)} mph`;
    }
    return `${speedKph} km/h`;
  };

  const getVisibility = (visKm: number) => {
    if (temperatureUnit === 'F') {
      return `${Math.round(visKm * 0.621371)} mi`;
    }
    return `${visKm} km`;
  };

  const getPressure = (pressureMb: number) => {
    if (temperatureUnit === 'F') {
      return `${(pressureMb * 0.02953).toFixed(2)} inHg`;
    }
    return `${pressureMb} mb`;
  };

  const getPrecipitation = (precipMm: number) => {
    if (temperatureUnit === 'F') {
      return `${(precipMm * 0.0394).toFixed(2)} in`;
    }
    return `${precipMm} mm`;
  };
  return (
    <div className="weather-display">
      <div className="weather-header">
        <h2 className="location-name">{weather.location}</h2>
        <button 
          className={`pin-button ${isPinned ? 'pinned' : ''}`}
          onClick={isPinned ? onUnpin : onPin}
          title={isPinned ? 'Unpin location' : 'Pin location'}
        >
          {isPinned ? '📌' : '📍'}
        </button>
      </div>
      
      <div className="current-weather">
        <div className="weather-icon">{getWeatherIcon(weather.current.description, weather.current.icon)}</div>
        <div className="temperature">{formatTemperature(weather.current.temp)}</div>
        <div className="weather-info">
          <div className="weather-description">{weather.current.description}</div>
          <div className="feels-like">Feels like {formatTemperature(weather.current.feels_like)}</div>
        </div>
      </div>

      <div className="weather-metrics">
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-icon">💧</div>
            <div className="metric-label">Humidity</div>
            <div className="metric-value">{weather.current.humidity}%</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">🌬️</div>
            <div className="metric-label">Wind</div>
            <div className="metric-value">{getWindSpeed(weather.current.windSpeed)}</div>
            <div className="metric-sublabel">{weather.current.windDirection}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">🌡️</div>
            <div className="metric-label">Pressure</div>
            <div className="metric-value">{getPressure(weather.current.pressure)}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">👁️</div>
            <div className="metric-label">Visibility</div>
            <div className="metric-value">{getVisibility(weather.current.visibility)}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">☀️</div>
            <div className="metric-label">UV Index</div>
            <div className="metric-value">{weather.current.uvIndex}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">☁️</div>
            <div className="metric-label">Cloud Cover</div>
            <div className="metric-value">{weather.current.cloudCover}%</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">🌧️</div>
            <div className="metric-label">Precipitation</div>
            <div className="metric-value">{getPrecipitation(weather.current.precipitation)}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-icon">💨</div>
            <div className="metric-label">Dew Point</div>
            <div className="metric-value">{formatTemperature(weather.current.dewPoint)}</div>
          </div>
        </div>
      </div>

      <div className="hourly-forecast">
        <h3 className="hourly-title">24-Hour Forecast</h3>
        <div className="hourly-list">
          {weather.hourly.map((hour, index) => (
            <div key={index} className="hourly-item">
              <div className="hourly-time">{hour.time}</div>
              <div className="hourly-icon">{getWeatherIcon(hour.description, hour.icon)}</div>
              <div className="hourly-temp">{formatTemperature(hour.temp)}</div>
              <div className="hourly-desc">{hour.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
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
        console.log('Migrating old pinned weather data to new format...');
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
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>(() => {
    const savedUnit = localStorage.getItem('weather-app-temp-unit');
    return (savedUnit as 'C' | 'F') || 'F';
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

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleTemperatureUnit = () => {
    setTemperatureUnit(prev => prev === 'C' ? 'F' : 'C');
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

  const pinLocation = () => {
    if (!currentLocation) return;
    
    const isAlreadyPinned = pinnedLocations.some(pinned => 
      pinned.name === currentLocation.name && pinned.country === currentLocation.country
    );
    
    if (!isAlreadyPinned) {
      setPinnedLocations(prev => [...prev, currentLocation]);
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
    return pinnedLocations.some(pinned => 
      `${pinned.name}, ${pinned.country}` === location
    );
  };

  const refreshWeatherData = async (manual = false) => {
    if (manual) setRefreshing(true);
    
    try {
      // Refresh current weather if available
      if (currentLocation) {
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

  // Load weather data for pinned locations on mount and when pinned locations change
  useEffect(() => {
    console.log('Pinned locations changed:', pinnedLocations);
    if (pinnedLocations.length > 0) {
      refreshWeatherData();
    }
  }, [pinnedLocations]);

  // Auto-refresh weather data every 10 minutes
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      refreshWeatherData();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, [currentLocation, pinnedLocations]);

  const handleLocationSelect = async (location: Location) => {
    setLoading(true);
    setError(null);
    setLocations([]);
    setQuery('');

    try {
      const weatherData = await getWeatherData(location);
      setWeather(weatherData);
      setCurrentLocation(location);
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
          <h1 className="app-title">Weather</h1>
          {lastRefresh && (
            <div className="last-refresh">
              Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        <div className="header-controls">
          {pinnedLocations.length > 0 && (
            <button 
              className="clear-pins-button" 
              onClick={() => {
                setPinnedLocations([]);
                setPinnedWeatherData({});
                localStorage.removeItem('weather-app-pinned');
              }}
              title="Clear all pinned locations"
            >
              🗑️
            </button>
          )}
          <button 
            className="refresh-button" 
            onClick={() => refreshWeatherData(true)}
            disabled={refreshing}
          >
            {refreshing ? '⟳' : '↻'}
          </button>
          <button className="temp-unit-toggle" onClick={toggleTemperatureUnit}>
            °{temperatureUnit}
          </button>
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
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

      <div className="weather-container">
        {pinnedLocations.map((location, index) => {
          // Validate location object
          if (!location || !location.name || !location.country) {
            return null;
          }
          
          const locationKey = `${location.name}, ${location.country}`;
          const weatherData = pinnedWeatherData[locationKey];
          
          if (!weatherData) {
            return (
              <div key={`pinned-loading-${index}`} className="weather-display">
                <div className="weather-header">
                  <h2 className="location-name">{locationKey}</h2>
                  <button 
                    className="pin-button pinned"
                    onClick={() => unpinLocation(locationKey)}
                    title="Unpin location"
                  >
                    📌
                  </button>
                </div>
                <div className="loading">Loading weather data...</div>
              </div>
            );
          }

          return (
            <WeatherCard
              key={`pinned-${index}`}
              weather={weatherData}
              isPinned={true}
              onPin={() => {}}
              onUnpin={() => unpinLocation(locationKey)}
              formatTemperature={formatTemperature}
              temperatureUnit={temperatureUnit}
            />
          );
        }).filter(Boolean)}

        {weather && !loading && !isLocationPinned(weather.location) && (
          <WeatherCard
            weather={weather}
            isPinned={false}
            onPin={pinLocation}
            onUnpin={() => unpinLocation(weather.location)}
            formatTemperature={formatTemperature}
            temperatureUnit={temperatureUnit}
          />
        )}
      </div>
    </div>
  );
}

export default App;
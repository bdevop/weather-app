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
}

const WeatherCard = ({ weather, isPinned, onPin, onUnpin }: WeatherCardProps) => {
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
        <div className="temperature">{weather.current.temp}°C</div>
        <div className="weather-info">
          <div className="weather-description">{weather.current.description}</div>
          <div className="feels-like">Feels like {weather.current.feels_like}°C</div>
        </div>
      </div>

      <div className="hourly-forecast">
        <h3 className="hourly-title">24-Hour Forecast</h3>
        <div className="hourly-list">
          {weather.hourly.map((hour, index) => (
            <div key={index} className="hourly-item">
              <div className="hourly-time">{hour.time}</div>
              <div className="hourly-icon">{getWeatherIcon(hour.description, hour.icon)}</div>
              <div className="hourly-temp">{hour.temp}°C</div>
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('weather-app-theme');
    return (savedTheme as 'light' | 'dark') || 'dark';
  });
  const [pinnedWeather, setPinnedWeather] = useState<WeatherData[]>(() => {
    const savedPinned = localStorage.getItem('weather-app-pinned');
    return savedPinned ? JSON.parse(savedPinned) : [];
  });

  useEffect(() => {
    localStorage.setItem('weather-app-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('weather-app-pinned', JSON.stringify(pinnedWeather));
  }, [pinnedWeather]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const pinLocation = (weatherData: WeatherData) => {
    const isAlreadyPinned = pinnedWeather.some(pinned => pinned.location === weatherData.location);
    if (!isAlreadyPinned) {
      setPinnedWeather(prev => [...prev, weatherData]);
    }
  };

  const unpinLocation = (location: string) => {
    setPinnedWeather(prev => prev.filter(pinned => pinned.location !== location));
  };

  const isLocationPinned = (location: string) => {
    return pinnedWeather.some(pinned => pinned.location === location);
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

  const handleLocationSelect = async (location: Location) => {
    setLoading(true);
    setError(null);
    setLocations([]);
    setQuery('');

    try {
      const weatherData = await getWeatherData(location);
      setWeather(weatherData);
    } catch (err) {
      setError('Failed to load weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1 className="app-title">Weather</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
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
        {pinnedWeather.map((pinnedWeatherData, index) => (
          <WeatherCard
            key={`pinned-${index}`}
            weather={pinnedWeatherData}
            isPinned={true}
            onPin={() => {}}
            onUnpin={() => unpinLocation(pinnedWeatherData.location)}
          />
        ))}

        {weather && !loading && !isLocationPinned(weather.location) && (
          <WeatherCard
            weather={weather}
            isPinned={false}
            onPin={() => pinLocation(weather)}
            onUnpin={() => unpinLocation(weather.location)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
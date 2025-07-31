import { useState, useEffect } from 'react';
import { Location, WeatherData } from './types';
import { searchLocations, getWeatherData } from './services/weatherApi';

function App() {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      {weather && !loading && (
        <div className="weather-display">
          <h2 className="location-name">{weather.location}</h2>
          
          <div className="current-weather">
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
                  <div className="hourly-temp">{hour.temp}°C</div>
                  <div className="hourly-desc">{hour.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
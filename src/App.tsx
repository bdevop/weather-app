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
import { Location, WeatherData } from './types';
import { searchLocations, getWeatherData } from './services/weatherApi';
import { WeatherCard, SortableWeatherCard } from './components/WeatherCard';
import { SearchBar } from './components/SearchBar';
import { Header } from './components/Header';
import { ErrorBoundary } from './components/ErrorBoundary';

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
    <ErrorBoundary>
      <div className="container">
        <Header
          theme={theme}
          onThemeToggle={toggleTheme}
          temperatureUnit={temperatureUnit}
          onTemperatureUnitToggle={toggleTemperatureUnit}
          layoutMode={layoutMode}
          onLayoutModeToggle={toggleLayoutMode}
          refreshing={refreshing}
          onRefresh={() => refreshWeatherData(true)}
          lastRefresh={lastRefresh}
        />
        
        <SearchBar
          query={query}
          onQueryChange={setQuery}
          locations={locations}
          onLocationSelect={handleLocationSelect}
          loading={loading}
        />

        {loading && <div className="loading">Loading weather data...</div>}
        
        {error && <div className="error" role="alert">{error}</div>}

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
    </ErrorBoundary>
  );
}

export default App;
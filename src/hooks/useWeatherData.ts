import { useState, useCallback, useRef, useEffect } from 'react';
import { Location, WeatherData } from '../types';
import { getWeatherData } from '../services/weatherApi';

interface UseWeatherDataProps {
  autoRefreshInterval?: number; // in milliseconds
  onError?: (error: Error) => void;
}

interface UseWeatherDataReturn {
  weatherData: { [key: string]: WeatherData };
  loading: { [key: string]: boolean };
  error: { [key: string]: Error | null };
  fetchWeather: (location: Location) => Promise<WeatherData | null>;
  fetchMultipleWeather: (locations: Location[]) => Promise<void>;
  refreshAll: () => Promise<void>;
  lastRefresh: Date | null;
  clearError: (locationKey: string) => void;
}

export const useWeatherData = ({
  autoRefreshInterval = 10 * 60 * 1000, // 10 minutes default
  onError
}: UseWeatherDataProps = {}): UseWeatherDataReturn => {
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherData }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<{ [key: string]: Error | null }>({});
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  const abortControllersRef = useRef<{ [key: string]: AbortController }>({});

  const getLocationKey = (location: Location): string => {
    return `${location.name}, ${location.country}`;
  };

  const fetchWeather = useCallback(async (location: Location): Promise<WeatherData | null> => {
    const locationKey = getLocationKey(location);
    
    // Cancel any existing request for this location
    if (abortControllersRef.current[locationKey]) {
      abortControllersRef.current[locationKey].abort();
    }
    
    // Create new abort controller
    const abortController = new AbortController();
    abortControllersRef.current[locationKey] = abortController;
    
    setLoading(prev => ({ ...prev, [locationKey]: true }));
    setError(prev => ({ ...prev, [locationKey]: null }));
    
    try {
      const data = await getWeatherData(location);
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        return null;
      }
      
      setWeatherData(prev => ({ ...prev, [locationKey]: data }));
      setLastRefresh(new Date());
      return data;
    } catch (err) {
      // Don't set error if request was aborted
      if (abortController.signal.aborted) {
        return null;
      }
      
      const error = err instanceof Error ? err : new Error('Failed to fetch weather data');
      setError(prev => ({ ...prev, [locationKey]: error }));
      
      if (onError) {
        onError(error);
      }
      
      return null;
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setLoading(prev => ({ ...prev, [locationKey]: false }));
      }
      
      // Clean up abort controller
      delete abortControllersRef.current[locationKey];
    }
  }, [onError]);

  const fetchMultipleWeather = useCallback(async (locations: Location[]): Promise<void> => {
    const promises = locations.map(location => fetchWeather(location));
    await Promise.all(promises);
  }, [fetchWeather]);

  const refreshAll = useCallback(async (): Promise<void> => {
    const locations = Object.keys(weatherData).map(key => {
      const [name, country] = key.split(', ');
      // Note: We're losing state info here, but it's not critical for refresh
      return { name, country } as Location;
    });
    
    await fetchMultipleWeather(locations);
  }, [weatherData, fetchMultipleWeather]);

  const clearError = useCallback((locationKey: string) => {
    setError(prev => ({ ...prev, [locationKey]: null }));
  }, []);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;
    
    const interval = setInterval(() => {
      refreshAll();
    }, autoRefreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefreshInterval, refreshAll]);

  // Cleanup abort controllers on unmount
  useEffect(() => {
    return () => {
      Object.values(abortControllersRef.current).forEach(controller => {
        controller.abort();
      });
    };
  }, []);

  return {
    weatherData,
    loading,
    error,
    fetchWeather,
    fetchMultipleWeather,
    refreshAll,
    lastRefresh,
    clearError
  };
};
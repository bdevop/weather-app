import { useState, useCallback, useRef, useEffect } from 'react';
import { Location } from '../types';
import { searchLocations } from '../services/weatherApi';

interface UseLocationSearchProps {
  debounceDelay?: number;
  onError?: (error: Error) => void;
}

interface UseLocationSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  locations: Location[];
  loading: boolean;
  error: Error | null;
  clearResults: () => void;
}

export const useLocationSearch = ({
  debounceDelay = 300,
  onError
}: UseLocationSearchProps = {}): UseLocationSearchReturn => {
  const [query, setQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear results if query is empty
    if (!searchQuery.trim()) {
      setLocations([]);
      setLoading(false);
      return;
    }
    
    // Create new abort controller
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    setLoading(true);
    setError(null);
    
    try {
      const results = await searchLocations(searchQuery);
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
      setLocations(results);
    } catch (err) {
      // Don't set error if request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
      const searchError = err instanceof Error ? err : new Error('Failed to search locations');
      setError(searchError);
      
      if (onError) {
        onError(searchError);
      }
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
    }
  }, [onError]);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceDelay);
    
    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceDelay, performSearch]);

  const clearResults = useCallback(() => {
    setLocations([]);
    setQuery('');
    setError(null);
    
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    query,
    setQuery,
    locations,
    loading,
    error,
    clearResults
  };
};
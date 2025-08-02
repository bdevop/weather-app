import { useState, useCallback, useEffect } from 'react';
import { Location } from '../types';

const STORAGE_KEY = 'weather-app-pinned';

interface UsePinnedLocationsReturn {
  pinnedLocations: Location[];
  pinLocation: (location: Location) => boolean; // returns true if pinned successfully
  unpinLocation: (locationKey: string) => void;
  reorderLocations: (oldIndex: number, newIndex: number) => void;
  isLocationPinned: (locationKey: string) => boolean;
  clearAllPinned: () => void;
}

export const usePinnedLocations = (): UsePinnedLocationsReturn => {
  const [pinnedLocations, setPinnedLocations] = useState<Location[]>(() => {
    const savedPinned = localStorage.getItem(STORAGE_KEY);
    if (!savedPinned) return [];
    
    try {
      const parsed = JSON.parse(savedPinned);
      
      // Validate data structure
      if (Array.isArray(parsed) && parsed.every(item => 
        item && typeof item === 'object' && 'name' in item && 'country' in item
      )) {
        return parsed;
      }
      
      // Invalid format, clear it
      localStorage.removeItem(STORAGE_KEY);
      return [];
    } catch (err) {
      console.error('Error parsing pinned locations:', err);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  });

  // Persist to localStorage whenever pinnedLocations changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinnedLocations));
  }, [pinnedLocations]);

  const getLocationKey = (location: Location | string): string => {
    if (typeof location === 'string') return location;
    return `${location.name}, ${location.country}`;
  };

  const pinLocation = useCallback((location: Location): boolean => {
    const locationKey = getLocationKey(location);
    
    // Check if already pinned
    const isAlreadyPinned = pinnedLocations.some(pinned => 
      getLocationKey(pinned) === locationKey
    );
    
    if (isAlreadyPinned) {
      return false; // Already pinned
    }
    
    setPinnedLocations(prev => [...prev, location]);
    return true;
  }, [pinnedLocations]);

  const unpinLocation = useCallback((locationKey: string) => {
    setPinnedLocations(prev => 
      prev.filter(pinned => getLocationKey(pinned) !== locationKey)
    );
  }, []);

  const reorderLocations = useCallback((oldIndex: number, newIndex: number) => {
    setPinnedLocations(prev => {
      const newLocations = [...prev];
      const [removed] = newLocations.splice(oldIndex, 1);
      newLocations.splice(newIndex, 0, removed);
      return newLocations;
    });
  }, []);

  const isLocationPinned = useCallback((locationKey: string): boolean => {
    return pinnedLocations.some(pinned => 
      getLocationKey(pinned) === locationKey
    );
  }, [pinnedLocations]);

  const clearAllPinned = useCallback(() => {
    setPinnedLocations([]);
  }, []);

  return {
    pinnedLocations,
    pinLocation,
    unpinLocation,
    reorderLocations,
    isLocationPinned,
    clearAllPinned
  };
};
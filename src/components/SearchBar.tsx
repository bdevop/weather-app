import React from 'react';
import { Location } from '../types';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  locations: Location[];
  onLocationSelect: (location: Location) => void;
  loading?: boolean;
}

export const SearchBar = React.memo(({ 
  query, 
  onQueryChange, 
  locations, 
  onLocationSelect,
  loading = false 
}: SearchBarProps) => {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Basic input sanitization - remove any HTML tags
    const sanitizedValue = value.replace(/<[^>]*>/g, '');
    onQueryChange(sanitizedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown' && locations.length > 0) {
      e.preventDefault();
      const firstItem = document.querySelector('.location-item') as HTMLElement;
      firstItem?.focus();
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number, location: Location) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onLocationSelect(location);
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextItem = document.querySelectorAll('.location-item')[index + 1] as HTMLElement;
        nextItem?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index === 0) {
          const input = document.querySelector('.search-input') as HTMLInputElement;
          input?.focus();
        } else {
          const prevItem = document.querySelectorAll('.location-item')[index - 1] as HTMLElement;
          prevItem?.focus();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onQueryChange('');
        const input = document.querySelector('.search-input') as HTMLInputElement;
        input?.focus();
        break;
    }
  };

  return (
    <div className="search-container" onKeyDown={handleKeyDown}>
      <input
        type="text"
        className="search-input"
        placeholder="Search for a location..."
        value={query}
        onChange={handleInputChange}
        aria-label="Search for a location"
        aria-describedby={locations.length > 0 ? "search-results" : undefined}
        aria-busy={loading}
        maxLength={100}
        autoComplete="off"
      />
      
      {locations.length > 0 && (
        <div 
          className="locations-list" 
          id="search-results"
          role="listbox"
          aria-label="Search results"
        >
          {locations.map((location, index) => (
            <div
              key={`${location.name}-${location.state}-${location.country}-${index}`}
              className="location-item"
              onClick={() => onLocationSelect(location)}
              onKeyDown={(e) => handleLocationKeyDown(e, index, location)}
              tabIndex={0}
              role="option"
              aria-selected={false}
            >
              {location.name}, {location.state && `${location.state}, `}{location.country}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
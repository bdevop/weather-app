import React from 'react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  temperatureUnit: 'C' | 'F';
  onTemperatureUnitToggle: () => void;
  layoutMode: 'stacked' | 'side-by-side';
  onLayoutModeToggle: () => void;
  refreshing: boolean;
  onRefresh: () => void;
  lastRefresh: Date | null;
}

export const Header = React.memo(({
  theme,
  onThemeToggle,
  temperatureUnit,
  onTemperatureUnitToggle,
  layoutMode,
  onLayoutModeToggle,
  refreshing,
  onRefresh,
  lastRefresh
}: HeaderProps) => {
  return (
    <div className="header">
      <div className="header-left">
        <h1 className="app-title">
          <span className="title-main">Weather</span>
          <span className="title-accent">Peek</span>
        </h1>
        {lastRefresh && (
          <div className="last-refresh" aria-live="polite">
            Updated {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
      <div className="header-controls">
        <button 
          type="button"
          className="refresh-button" 
          onClick={onRefresh}
          disabled={refreshing}
          data-tooltip="Refresh weather data"
          aria-label="Refresh weather data"
          aria-busy={refreshing}
        >
          <span className={refreshing ? 'rotating' : ''}>↻</span>
        </button>
        <button 
          type="button"
          className="temp-unit-toggle" 
          onClick={onTemperatureUnitToggle}
          data-tooltip={`Switch to °${temperatureUnit === 'F' ? 'C' : 'F'}`}
          aria-label={`Switch to ${temperatureUnit === 'F' ? 'Celsius' : 'Fahrenheit'}`}
          aria-pressed={temperatureUnit === 'F'}
        >
          °{temperatureUnit}
        </button>
        <button 
          type="button"
          className="layout-toggle" 
          onClick={onLayoutModeToggle}
          data-tooltip={layoutMode === 'stacked' ? 'Switch to side-by-side layout' : 'Switch to stacked layout'}
          aria-label={layoutMode === 'stacked' ? 'Switch to side-by-side layout' : 'Switch to stacked layout'}
          aria-pressed={layoutMode === 'side-by-side'}
        >
          {layoutMode === 'stacked' ? 'Grid' : 'Stack'}
        </button>
        <button 
          type="button"
          className="theme-toggle" 
          onClick={onThemeToggle}
          data-tooltip={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </div>
    </div>
  );
});

Header.displayName = 'Header';
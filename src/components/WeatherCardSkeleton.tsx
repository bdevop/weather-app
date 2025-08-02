import React from 'react';

export const WeatherCardSkeleton: React.FC = () => {
  return (
    <div className="weather-display skeleton-loading">
      <div className="skeleton-header">
        <div className="skeleton-location">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-subtitle"></div>
        </div>
        <div className="skeleton-buttons">
          <div className="skeleton-button"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
      
      <div className="skeleton-current">
        <div className="skeleton-icon"></div>
        <div className="skeleton-temp"></div>
        <div className="skeleton-info">
          <div className="skeleton-line"></div>
          <div className="skeleton-line skeleton-short"></div>
        </div>
      </div>

      <div className="skeleton-metrics">
        <div className="skeleton-metric">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-value"></div>
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-value"></div>
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-value"></div>
        </div>
        <div className="skeleton-metric">
          <div className="skeleton-line skeleton-label"></div>
          <div className="skeleton-line skeleton-value"></div>
        </div>
      </div>

      <div className="skeleton-forecast">
        <div className="skeleton-line skeleton-forecast-title"></div>
        <div className="skeleton-forecast-list">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton-forecast-item">
              <div className="skeleton-line skeleton-time"></div>
              <div className="skeleton-icon-small"></div>
              <div className="skeleton-line skeleton-temp-small"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SearchResultSkeleton: React.FC = () => {
  return (
    <div className="search-results-skeleton">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton-search-item">
          <div className="skeleton-line skeleton-search-text"></div>
        </div>
      ))}
    </div>
  );
};
# Weather App Color Schema Documentation

This document outlines the comprehensive color system designed for the weather application, featuring contextual colors that adapt based on weather conditions, time of day, and temperature ranges.

## Overview

The color schema provides subtle visual cues that enhance the user experience by:
- **Weather Condition Theming**: Cards adapt colors based on current weather
- **Time-of-Day Variations**: Colors shift based on sunrise/sunset times and local time
- **Temperature Color Coding**: Temperature displays use contextual colors
- **Dual Theme Support**: All colors work in both light and dark modes

## Color Categories

### 1. Weather Condition Colors

Weather-specific color palettes that apply to weather cards and forecast items:

#### Light Mode
```css
/* Sunny/Clear Weather */
--sunny-primary: #B8860B     /* Muted gold */
--sunny-secondary: #D4A574   /* Light gold */
--sunny-bg: #FEFCF8          /* Warm white */
--sunny-border: #F0F0E8      /* Cream border */

/* Cloudy Weather */
--cloudy-primary: #8899A6    /* Blue-gray */
--cloudy-secondary: #9BADB7  /* Light blue-gray */
--cloudy-bg: #FAFBFB         /* Cool white */
--cloudy-border: #EAEEF0     /* Light gray border */

/* Rainy Weather */
--rainy-primary: #5B9BD5     /* Muted blue */
--rainy-secondary: #7CAEE5   /* Light blue */
--rainy-bg: #F8FBFD          /* Blue-tinted white */
--rainy-border: #E8F2F8      /* Light blue border */

/* Stormy Weather */
--stormy-primary: #8B7BB8    /* Muted purple */
--stormy-secondary: #A396C8  /* Light purple */
--stormy-bg: #FAFAFA         /* Neutral white */
--stormy-border: #F0EDF5     /* Purple-tinted border */

/* Snowy Weather */
--snowy-primary: #5BA3B8     /* Muted teal */
--snowy-secondary: #7CB5C8   /* Light teal */
--snowy-bg: #F8FCFD          /* Cool white */
--snowy-border: #E8F5F8      /* Light teal border */

/* Foggy Weather */
--foggy-primary: #9E9E9E     /* Gray */
--foggy-secondary: #B5B5B5   /* Light gray */
--foggy-bg: #FBFBFB          /* Off-white */
--foggy-border: #F0F0F0      /* Light gray border */
```

#### Dark Mode
Weather condition colors are adapted for dark backgrounds with appropriate contrast:

```css
/* Example: Sunny colors in dark mode */
--sunny-primary: #B8A675     /* Warm gold */
--sunny-bg: #201f1c          /* Dark warm background */
--sunny-border: #2a2925      /* Dark warm border */
```

### 2. Temperature-Based Colors

Temperature ranges are color-coded for quick visual recognition:

#### Light Mode
```css
--temp-hot: #C57C53      /* Hot (30°C+) - Warm brown */
--temp-warm: #C5A15A     /* Warm (20-29°C) - Golden brown */
--temp-mild: #7BA67D     /* Mild (10-19°C) - Muted green */
--temp-cool: #5B94C5     /* Cool (0-9°C) - Blue */
--temp-cold: #6B79B8     /* Cold (<0°C) - Blue-purple */
```

#### Dark Mode
Temperature colors maintain the same relative relationships but are adjusted for dark backgrounds.

### 3. Time-of-Day Colors

Colors that adapt based on local sunrise/sunset times:

#### Time Periods
- **Dawn**: 1 hour before to 1 hour after sunrise
- **Day**: After dawn period until 1 hour before sunset
- **Dusk**: 1 hour before to 1 hour after sunset  
- **Night**: After dusk period until dawn

#### Light Mode
```css
/* Dawn (Golden Hour) */
--dawn-primary: #B8A675
--dawn-bg: #FEFDF9          /* Warm morning light */
--dawn-border: #F5F3ED

/* Day (Bright Daylight) */
--day-primary: #6B94C5
--day-bg: #FAFCFE           /* Clear sky blue */
--day-border: #F0F5FA

/* Dusk (Golden Hour) */
--dusk-primary: #C59975
--dusk-bg: #FEFBF8          /* Warm evening light */
--dusk-border: #F5F1ED

/* Night (Starlight) */
--night-primary: #7B8BC5
--night-bg: #FAFBFE         /* Cool moonlight */
--night-border: #F0F2F8
```

### 4. Interactive Element Colors

Subtle colors for buttons and interactive elements:

```css
--pin-active: #C57C53       /* Pinned location indicator */
--pin-hover: #D49370        /* Pin button hover state */
--success-color: #6B9B6F    /* Success actions (refresh) */
--accent-gradient: linear-gradient(135deg, #8A9BC5 0%, #9A8BC2 100%)
```

### 5. Metric-Specific Colors

Individual weather metrics have contextual colors:

```css
.metric-item.humidity .metric-value { color: var(--rainy-primary); }
.metric-item.wind .metric-value { color: var(--cloudy-primary); }
.metric-item.pressure .metric-value { color: var(--stormy-primary); }
.metric-item.visibility .metric-value { color: var(--foggy-primary); }
.metric-item.uv .metric-value { color: var(--sunny-primary); }
.metric-item.feels-like .metric-value { color: var(--temp-warm); }
```

## Implementation Details

### Dynamic Class Application

The app dynamically applies CSS classes based on weather data:

1. **Weather Condition Classes**: `.sunny`, `.cloudy`, `.rainy`, `.stormy`, `.snowy`, `.foggy`
2. **Time Period Classes**: `.time-dawn`, `.time-day`, `.time-dusk`, `.time-night`  
3. **Temperature Classes**: `.temp-hot`, `.temp-warm`, `.temp-mild`, `.temp-cool`, `.temp-cold`

### Priority System

When multiple color systems could apply, the priority is:
1. **Time-of-day colors** (highest priority - override weather conditions)
2. **Weather condition colors** (medium priority)
3. **Default theme colors** (lowest priority)

### JavaScript Logic

#### Weather Condition Detection
```javascript
const getWeatherCondition = (conditionText) => {
  const condition = conditionText.toLowerCase();
  if (condition.includes('clear') || condition.includes('sunny')) return 'sunny';
  if (condition.includes('thunder') || condition.includes('storm')) return 'stormy';
  // ... additional conditions
  return 'cloudy'; // default
};
```

#### Time Period Calculation
```javascript
const getTimeOfDay = (localTime, sunrise, sunset) => {
  // Parses sunrise/sunset times and current local time
  // Returns 'time-dawn', 'time-day', 'time-dusk', or 'time-night'
};
```

#### Temperature Classification
```javascript
const getTemperatureClass = (tempC) => {
  if (tempC >= 30) return 'temp-hot';
  if (tempC >= 20) return 'temp-warm';
  if (tempC >= 10) return 'temp-mild';
  if (tempC >= 0) return 'temp-cool';
  return 'temp-cold';
};
```

## Design Philosophy

### Subtlety Over Boldness
- Colors are muted and sophisticated rather than vibrant
- Effects are minimal to maintain professional appearance
- Changes are noticeable but not distracting

### Contextual Intelligence
- Colors provide meaningful information about weather conditions
- Time-based colors reflect the natural lighting of each location
- Temperature colors give instant visual feedback

### Accessibility Considerations
- All color combinations maintain proper contrast ratios
- Color is never the only way information is conveyed
- Dark mode colors are carefully calibrated for readability

### Cross-Platform Consistency
- CSS custom properties ensure consistent color application
- Colors work across different devices and screen types
- Fallback colors provided for older browsers

## Usage Examples

### Weather Card Styling
```css
/* A sunny morning card would have classes: */
.weather-display.sunny.time-dawn {
  background: var(--dawn-bg);      /* Overrides sunny-bg */
  border-color: var(--dawn-border);
}

/* Location name gets time-based color */
.weather-display.time-dawn .location-name {
  color: var(--dawn-primary);
}
```

### Temperature Display
```css
/* Hot temperature in any weather condition */
.temperature.temp-hot {
  color: var(--temp-hot);
}
```

### Forecast Items
```css
/* Forecast items inherit weather condition colors */
.forecast-item.rainy {
  background: var(--rainy-bg);
  border-color: var(--rainy-border);
}
```

## Future Enhancements

Potential additions to the color schema:
- **Seasonal color variations** (spring greens, autumn oranges)
- **Air quality index colors** (if AQI data becomes available)
- **Weather alert colors** (for severe weather warnings)
- **User preference overrides** (allow users to customize intensity)

## Maintenance Notes

- All colors use CSS custom properties for easy theme switching
- Color values are defined once and referenced throughout
- Dark mode colors are automatically applied via `[data-theme="dark"]`
- New weather conditions can be added by extending the existing pattern

---

*This color schema balances visual appeal with functional clarity, providing users with intuitive color cues while maintaining a clean, professional aesthetic.*
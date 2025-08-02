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

#### Light Mode - 10-Color Fire-to-Ice Gradient
```css
--temp-scorching: #B22222    /* Scorching (100°F+ / 38°C+) - Deep Red */
--temp-very-hot: #FF4500     /* Very Hot (90-99°F / 32-37°C) - Red-Orange */
--temp-hot: #FF8C00          /* Hot (80-89°F / 27-31°C) - Orange */
--temp-warm: #FFA500         /* Warm (70-79°F / 21-26°C) - Yellow-Orange */
--temp-pleasant: #FFD700     /* Pleasant (60-69°F / 16-20°C) - Golden Yellow */
--temp-mild: #F0E68C         /* Mild (50-59°F / 10-15°C) - Light Yellow */
--temp-cool: #87CEEB         /* Cool (40-49°F / 4-9°C) - Sky Blue */
--temp-cold: #4682B4         /* Cold (30-39°F / -1-3°C) - Steel Blue */
--temp-very-cold: #5F9EA0    /* Very Cold (20-29°F / -7 to -2°C) - Cadet Blue */
--temp-freezing: #008B8B     /* Freezing (<20°F / <-7°C) - Dark Cyan */
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
3. **Temperature Classes**: `.temp-scorching`, `.temp-very-hot`, `.temp-hot`, `.temp-warm`, `.temp-pleasant`, `.temp-mild`, `.temp-cool`, `.temp-cold`, `.temp-very-cold`, `.temp-freezing`

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
  if (tempC >= 38) return 'temp-scorching';    // 100°F+
  if (tempC >= 32) return 'temp-very-hot';     // 90-99°F
  if (tempC >= 27) return 'temp-hot';          // 80-89°F
  if (tempC >= 21) return 'temp-warm';         // 70-79°F
  if (tempC >= 16) return 'temp-pleasant';     // 60-69°F
  if (tempC >= 10) return 'temp-mild';         // 50-59°F
  if (tempC >= 4) return 'temp-cool';          // 40-49°F
  if (tempC >= -1) return 'temp-cold';         // 30-39°F
  if (tempC >= -7) return 'temp-very-cold';    // 20-29°F
  return 'temp-freezing';                      // <20°F
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
/* Pleasant temperature (60-69°F) in any weather condition */
.temperature.temp-pleasant {
  color: var(--temp-pleasant);
}

/* All 10 temperature classes available */
.temperature.temp-scorching { color: var(--temp-scorching); }
.temperature.temp-very-hot { color: var(--temp-very-hot); }
.temperature.temp-hot { color: var(--temp-hot); }
.temperature.temp-warm { color: var(--temp-warm); }
.temperature.temp-pleasant { color: var(--temp-pleasant); }
.temperature.temp-mild { color: var(--temp-mild); }
.temperature.temp-cool { color: var(--temp-cool); }
.temperature.temp-cold { color: var(--temp-cold); }
.temperature.temp-very-cold { color: var(--temp-very-cold); }
.temperature.temp-freezing { color: var(--temp-freezing); }
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
export const getWeatherCondition = (conditionText: string): string => {
  const condition = conditionText.toLowerCase();
  
  if (condition.includes('clear') || condition.includes('sunny')) {
    return 'sunny';
  }
  if (condition.includes('thunder') || condition.includes('storm') || condition.includes('lightning')) {
    return 'stormy';
  }
  if (condition.includes('rain') || condition.includes('shower') || condition.includes('drizzle')) {
    return 'rainy';
  }
  if (condition.includes('snow') || condition.includes('blizzard') || condition.includes('sleet') || condition.includes('ice')) {
    return 'snowy';
  }
  if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
    return 'foggy';
  }
  if (condition.includes('cloudy') || condition.includes('overcast')) {
    return 'cloudy';
  }
  
  return 'cloudy'; // default
};

export const getTemperatureClass = (tempC: number): string => {
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

const parseTime = (timeStr: string): number => {
  const [time, period] = timeStr.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  let hour24 = hours;
  
  if (period === 'PM' && hours !== 12) {
    hour24 += 12;
  } else if (period === 'AM' && hours === 12) {
    hour24 = 0;
  }
  
  return hour24 * 60 + minutes; // Convert to minutes since midnight
};

export const getTimeOfDay = (localTime: string, sunrise: string, sunset: string): string => {
  // Parse current time from localTime (format: "2024-01-01 14:30")
  const currentTime = new Date(localTime);
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  const sunriseMinutes = parseTime(sunrise);
  const sunsetMinutes = parseTime(sunset);
  
  // Define time periods (in minutes before/after sunrise/sunset)
  const dawnStart = sunriseMinutes - 30; // 30 min before sunrise
  const dawnEnd = sunriseMinutes + 15;   // 15 min after sunrise
  const duskStart = sunsetMinutes - 30;  // 30 min before sunset
  const duskEnd = sunsetMinutes + 15;    // 15 min after sunset
  
  if (currentMinutes >= dawnStart && currentMinutes <= dawnEnd) {
    return 'time-dawn';
  } else if (currentMinutes > dawnEnd && currentMinutes < duskStart) {
    return 'time-day';
  } else if (currentMinutes >= duskStart && currentMinutes <= duskEnd) {
    return 'time-dusk';
  } else {
    return 'time-night';
  }
};

export const getForecastTimeOfDay = (hourDatetime: string, sunrise: string, sunset: string): string => {
  // Parse the hour datetime (format: "2024-01-01 14:00")
  const hourTime = new Date(hourDatetime);
  const hourMinutes = hourTime.getHours() * 60 + hourTime.getMinutes();
  
  const sunriseMinutes = parseTime(sunrise);
  const sunsetMinutes = parseTime(sunset);
  
  // Define time periods (same as main function)
  const dawnStart = sunriseMinutes - 30;
  const dawnEnd = sunriseMinutes + 15;
  const duskStart = sunsetMinutes - 30;
  const duskEnd = sunsetMinutes + 15;
  
  if (hourMinutes >= dawnStart && hourMinutes <= dawnEnd) {
    return 'time-dawn';
  } else if (hourMinutes > dawnEnd && hourMinutes < duskStart) {
    return 'time-day';
  } else if (hourMinutes >= duskStart && hourMinutes <= duskEnd) {
    return 'time-dusk';
  } else {
    return 'time-night';
  }
};

export const getWeatherIcon = (conditionText: string, iconUrl: string): string => {
  // WeatherAPI.com provides detailed condition text, let's use that for better accuracy
  const condition = conditionText.toLowerCase();
  const isNight = iconUrl.includes('/night/');
  
  // Clear conditions
  if (condition.includes('clear') || condition.includes('sunny')) {
    return isNight ? '🌙' : '☀️';
  }
  
  // Partly cloudy variations
  if (condition.includes('partly cloudy') || condition.includes('partly overcast')) {
    return isNight ? '☁️' : '⛅';
  }
  
  // Cloudy conditions
  if (condition.includes('cloudy') || condition.includes('overcast')) {
    return '☁️';
  }
  
  // Mist/Fog variations
  if (condition.includes('mist') || condition.includes('fog') || condition.includes('haze')) {
    return '🌫️';
  }
  
  // Rain conditions (ordered from heaviest to lightest for better matching)
  if (condition.includes('heavy rain') || condition.includes('torrential') || condition.includes('moderate rain')) {
    return '🌧️';
  }
  if (condition.includes('patchy rain') || condition.includes('light rain') || condition.includes('drizzle')) {
    return '🌦️';
  }
  if (condition.includes('rain') || condition.includes('shower')) {
    return '🌧️';
  }
  
  // Thunder/Storm variations
  if (condition.includes('thunder') || condition.includes('storm') || condition.includes('lightning')) {
    return '⛈️';
  }
  
  // Snow conditions
  if (condition.includes('heavy snow') || condition.includes('blizzard')) {
    return '🌨️';
  }
  if (condition.includes('patchy snow') || condition.includes('light snow') || condition.includes('snow')) {
    return '❄️';
  }
  if (condition.includes('sleet') || condition.includes('ice pellets')) {
    return '🧊';
  }
  
  // Hail
  if (condition.includes('hail')) {
    return '🧊';
  }
  
  // Wind conditions
  if (condition.includes('windy') || condition.includes('gale') || condition.includes('breezy')) {
    return '💨';
  }
  
  // Freezing conditions
  if (condition.includes('freezing')) {
    return '🧊';
  }
  
  // Default fallback
  return isNight ? '🌙' : '🌤️';
};
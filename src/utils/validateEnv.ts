export const validateEnvironmentVariables = (): void => {
  const requiredEnvVars = ['VITE_WEATHERAPI_KEY'] as const;
  const missingVars: string[] = [];

  requiredEnvVars.forEach(varName => {
    if (!import.meta.env[varName] || import.meta.env[varName] === 'demo_key') {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    const errorMessage = `Missing or invalid required environment variables: ${missingVars.join(', ')}`;
    
    // In development, log a warning but continue
    if (import.meta.env.DEV) {
      console.warn(`⚠️ ${errorMessage}`);
      console.warn('The app will continue to run but API calls may fail.');
      console.warn('Please create a .env file with your WeatherAPI key:');
      console.warn('VITE_WEATHERAPI_KEY=your_api_key_here');
    } else {
      // In production, throw an error
      throw new Error(errorMessage);
    }
  }
};

// Validate API key format (basic check)
export const isValidApiKey = (apiKey: string): boolean => {
  // WeatherAPI keys are typically 32 characters long
  // This is a basic check - adjust based on actual API key format
  return apiKey.length >= 20 && apiKey !== 'demo_key';
};
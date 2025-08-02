import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { validateEnvironmentVariables } from './utils/validateEnv'

// Validate environment variables on app startup
try {
  validateEnvironmentVariables();
} catch (error) {
  console.error('Environment validation failed:', error);
  // Optionally show an error UI instead of the app
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
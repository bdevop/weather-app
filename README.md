# Weather App

A minimalistic weather application built with React and TypeScript that allows users to search for locations and view hourly weather forecasts.

## Features

- 🔍 Location search with autocomplete
- 🌤️ Current weather display
- ⏰ 24-hour weather forecast
- 📱 Responsive, minimalistic design
- 🐳 Docker support
- ☸️ Kubernetes deployment ready

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- WeatherAPI.com API key (free at [weatherapi.com](https://www.weatherapi.com/signup.aspx))

### Development Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd weather-app
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and add your WeatherAPI.com API key
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
pnpm build
pnpm preview
```

## Docker Deployment

### Build the Docker image with your API key:
```bash
export WEATHERAPI_KEY="your-api-key-here"
docker build --build-arg VITE_WEATHERAPI_KEY="$WEATHERAPI_KEY" -t weather-app .
```

### Run the container:
```bash
docker run -p 8080:80 weather-app
```

## Kubernetes Deployment

### 🔒 Secure Deployment (Recommended)

Use the provided script for secure deployment:

```bash
# Make the script executable
chmod +x scripts/build-and-deploy.sh

# Run the deployment (will prompt for API key securely)
./scripts/build-and-deploy.sh
```

Or set the API key as an environment variable:
```bash
export WEATHERAPI_KEY="your-api-key-here"
./scripts/build-and-deploy.sh
```

### 📋 Manual Deployment Steps

1. **Build the image** with your API key:
   ```bash
   docker build --build-arg VITE_WEATHERAPI_KEY="your-api-key" -t weather-app .
   ```

2. **Load image into cluster** (if using local cluster):
   ```bash
   # For kind:
   kind load docker-image weather-app:latest
   
   # For minikube:
   minikube image load weather-app:latest
   ```

3. **Deploy to Kubernetes**:
   ```bash
   kubectl apply -f k8s/deployment.yaml
   kubectl apply -f k8s/service.yaml
   kubectl apply -f k8s/ingress.yaml
   ```

4. **Access the application**:
   ```bash
   kubectl port-forward service/weather-app-service 8080:80
   # Visit http://localhost:8080
   ```

### 🛡️ Security Best Practices

- **Never commit API keys** to your repository
- **Regenerate your API key** if accidentally exposed
- **Use environment variables** or secure secret management
- **Keep Docker images private** when they contain secrets
- **Use Kubernetes secrets** for sensitive data in production

### 🔄 CI/CD Integration

For automated deployments, set the API key as a secret in your CI/CD system:

**GitHub Actions:**
```yaml
- name: Build and push
  env:
    WEATHERAPI_KEY: ${{ secrets.WEATHERAPI_KEY }}
  run: |
    docker build --build-arg VITE_WEATHERAPI_KEY="$WEATHERAPI_KEY" -t weather-app .
```

**GitLab CI:**
```yaml
build:
  script:
    - docker build --build-arg VITE_WEATHERAPI_KEY="$WEATHERAPI_KEY" -t weather-app .
  variables:
    WEATHERAPI_KEY: $CI_WEATHERAPI_KEY
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS with modern gradients and glassmorphism
- **API**: WeatherAPI.com
- **Containerization**: Docker with multi-stage build
- **Orchestration**: Kubernetes with deployment, service, and ingress

## API Usage

The app uses the WeatherAPI.com API for:
- Location search API for finding places
- Forecast API for current weather and hourly data

## License

ISC
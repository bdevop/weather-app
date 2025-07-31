#!/bin/bash

# Weather App Kubernetes Deployment Script
# This script securely deploys the weather app with your API key

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌤️  Weather App Kubernetes Deployment${NC}"
echo "=========================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed or not in PATH${NC}"
    exit 1
fi

# Check if we're connected to a cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Not connected to a Kubernetes cluster${NC}"
    exit 1
fi

# Prompt for API key if not provided as environment variable
if [ -z "$WEATHERAPI_KEY" ]; then
    echo -e "${YELLOW}🔑 Please enter your WeatherAPI.com API key:${NC}"
    read -s WEATHERAPI_KEY
    echo
fi

if [ -z "$WEATHERAPI_KEY" ]; then
    echo -e "${RED}❌ API key is required${NC}"
    exit 1
fi

# Validate API key format (basic check)
if [ ${#WEATHERAPI_KEY} -ne 32 ]; then
    echo -e "${YELLOW}⚠️  Warning: API key doesn't match expected format (32 characters)${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}📦 Creating Kubernetes secret...${NC}"

# Create the secret with the API key
kubectl create secret generic weather-app-secret \
    --from-literal=api-key="$WEATHERAPI_KEY" \
    --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}🚀 Deploying application...${NC}"

# Apply all Kubernetes manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

echo -e "${GREEN}⏳ Waiting for deployment to be ready...${NC}"
kubectl rollout status deployment/weather-app --timeout=300s

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo
echo "📊 Deployment status:"
kubectl get pods -l app=weather-app
echo
echo "🌐 Service information:"
kubectl get service weather-app-service
echo
echo "🔗 To access the application:"
echo "   Port forward: kubectl port-forward service/weather-app-service 8080:80"
echo "   Then visit: http://localhost:8080"
echo
echo -e "${YELLOW}🔒 Security reminder: Never commit API keys to your repository!${NC}"
#!/bin/bash

# Complete build and deployment script for Weather App
# This script builds the Docker image with your API key and deploys to Kubernetes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌤️  Weather App - Build & Deploy${NC}"
echo "===================================="

# Check prerequisites
echo -e "${GREEN}🔍 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed${NC}"
    exit 1
fi

if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Not connected to a Kubernetes cluster${NC}"
    exit 1
fi

# Get API key
if [ -z "$WEATHERAPI_KEY" ]; then
    echo -e "${YELLOW}🔑 Please enter your WeatherAPI.com API key:${NC}"
    read -s WEATHERAPI_KEY
    echo
fi

if [ -z "$WEATHERAPI_KEY" ]; then
    echo -e "${RED}❌ API key is required${NC}"
    exit 1
fi

# Set image tag (you can customize this)
IMAGE_TAG=${IMAGE_TAG:-"weather-app:latest"}

echo -e "${GREEN}🏗️  Building Docker image with API key...${NC}"
docker build --build-arg VITE_WEATHERAPI_KEY="$WEATHERAPI_KEY" -t "$IMAGE_TAG" .

echo -e "${GREEN}📦 Loading image into cluster (if using kind/minikube)...${NC}"
# Uncomment the line below if using kind
# kind load docker-image "$IMAGE_TAG"

# Uncomment the line below if using minikube
# minikube image load "$IMAGE_TAG"

echo -e "${GREEN}🚀 Deploying to Kubernetes...${NC}"
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

echo -e "${GREEN}⏳ Waiting for deployment...${NC}"
kubectl rollout status deployment/weather-app --timeout=300s

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo
echo "📊 Deployment status:"
kubectl get pods -l app=weather-app
echo
echo "🌐 Service information:"
kubectl get service weather-app-service
echo
echo "🔗 Access your application:"
echo "   Port forward: kubectl port-forward service/weather-app-service 8080:80"
echo "   Then visit: http://localhost:8080"
echo
echo -e "${YELLOW}🔒 Security Note: API key is embedded in the image. Keep your images secure!${NC}"
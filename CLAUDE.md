# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a modern React weather application built with TypeScript and Vite. The app allows users to search for locations, view current weather conditions and forecasts, and pin multiple locations for comparison. It features a clean, responsive UI with dark/light theme support and is containerized for deployment via Docker.

## Development Commands

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build for production (TypeScript compilation + Vite build)
- `pnpm preview` - Preview production build locally
- `pnpm typecheck` - Run TypeScript type checking

## Architecture

The application follows a standard React architecture with clear separation of concerns:

- **Entry Point**: `src/main.tsx` - Renders the React app
- **Main Component**: `src/App.tsx` - Contains all application logic, state management, and UI
- **API Layer**: `src/services/weatherApi.ts` - Handles WeatherAPI.com integration
- **Type Definitions**: `src/types.ts` - TypeScript interfaces for Location and Weather data
- **Styling**: `src/index.css` - All CSS with CSS custom properties for theming

## Key Features & Architecture Patterns

### State Management
All state is managed locally in `App.tsx` using React hooks:
- Weather data caching for pinned locations
- Persistent settings in localStorage (theme, temperature units, layout, collapsed states)
- Auto-refresh mechanism every 10 minutes
- Debounced search with 300ms delay

### API Integration
- Uses WeatherAPI.com with search and forecast endpoints
- Environment variable: `VITE_WEATHERAPI_KEY`
- Error handling with fallback behaviors
- Coordinate-based weather fetching for accuracy

### UI Patterns
- **WeatherCard Component**: Reusable component for displaying weather data
- **Toggle Controls**: Theme, temperature units (°C/°F), layout modes
- **Responsive Design**: Stacked vs side-by-side layouts
- **Collapsible Cards**: Per-location state persistence
- **Forecast Modes**: Hourly (24h) vs Daily (7-day) toggle per location

### Data Persistence
- Pinned locations stored as Location objects (not weather data)
- Settings persist across sessions via localStorage
- Migration logic for handling old data formats

## Environment Setup

### Required Environment Variables
- `VITE_WEATHERAPI_KEY` - WeatherAPI.com API key (required for build)

### Development Dependencies
- React 18 with TypeScript
- Vite for build tooling and dev server
- TypeScript for type checking and compilation

## Deployment Architecture

### Docker
- Multi-stage build with API key as build argument
- Nginx server for production serving
- Exposed on port 80 internally, configurable externally

### CI/CD Integration
- This repository focuses on application code and Docker image building
- Kubernetes deployment is handled by a separate GitOps repository with Flux
- CI pipeline should build and push images to Azure Container Registry

## File Structure Patterns

- **Single Page Application**: All logic in `App.tsx` with one reusable `WeatherCard` component
- **Service Layer**: Clean separation of API calls in dedicated service file
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures
- **CSS Architecture**: Single stylesheet with CSS custom properties for theming

## Claude Code Workflow Instructions

### Task Confirmation Protocol
ALWAYS follow this protocol before executing any code changes:

1. **Create Todo List**: Use TodoWrite tool to create a clear todo list breaking down the requested task
2. **Confirm Understanding**: Explicitly confirm what you understand the user is asking for
3. **Get User Approval**: Wait for user confirmation before proceeding with code execution
4. **Execute Step-by-Step**: Work through todos one at a time, marking as in_progress/completed

### Example Workflow
```
User: "Add a new feature X"
Assistant: 
1. Creates todo list with specific steps
2. "I understand you want me to add feature X. Here's my plan: [todo list]. Should I proceed?"
3. User confirms
4. Execute todos one by one with status updates
```

This ensures alignment and prevents unwanted code changes.

## Commit Message Guidelines

When creating commits, do NOT include the Claude Code signature lines:
- Remove "🤖 Generated with [Claude Code](https://claude.ai/code)"
- Remove "Co-Authored-By: Claude <noreply@anthropic.com>"

Use clean, descriptive commit messages that focus on the changes made.
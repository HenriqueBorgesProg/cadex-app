# Cadex FTTH Planner Frontend

React + Vite frontend for the Cadex FTTH Planner MVP.

## Requirements

- Node.js
- Backend running at `http://localhost:3000`

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Features

- Interactive Leaflet map
- Point creation by map click
- Client and pole visualization
- Network generation through the backend using road routes
- Route planning between existing points
- Suggested pole rendering
- Financial estimate metrics
- Connection and simulation rendering with polylines
- Network and route metrics panel
- Loading and error states

## Architecture

```txt
src/
  components/  UI components
  hooks/       State and interaction orchestration
  pages/       Screen composition
  services/    API communication
  styles/      Application styles
  types/       Shared frontend types
```

The frontend does not calculate network rules, routes, pole suggestions, or costs. It sends points to the backend, receives generated connections or route previews, and renders the result.

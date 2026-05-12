# Cadex Network Optimizer Frontend

React + Vite frontend for the Cadex Network Optimizer MVP.

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
- Network generation through the backend
- Connection rendering with polylines
- Network metrics panel
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

The frontend does not calculate network rules. It sends points to the backend, receives generated connections, and renders the result.

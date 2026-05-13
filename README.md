# Cadex Network Optimizer

Cadex Network Optimizer is a full-stack MVP for visualizing and generating a simple geographic network between clients and poles.

The system lets users create geographic points on a map, classify them as `client` or `pole`, persist them through the backend, and generate a network where each client is connected to the nearest pole.

## Project Goal

The goal of this project is to demonstrate:

- Clean backend architecture
- Database schema versioning with migrations
- Separation between business logic and HTTP
- Geospatial visualization with Leaflet
- Frontend/backend integration
- A practical product-like user flow

The frontend does not calculate the network. It only sends data, consumes API responses, and renders the result. The backend owns the domain rules and distance calculation.

## Tech Stack

### Backend

- Node.js
- TypeScript
- Fastify
- TypeORM
- PostgreSQL
- Migrations

### Frontend

- React
- TypeScript
- Vite
- Leaflet
- React Leaflet
- Axios
- Lucide React

## Repository Structure

```txt
cadex-app/
  backend/
    src/
      modules/
        points/
        network/
      shared/
        database/
        errors/
        http/
        utils/
    docs/
      api-contract.md
    package.json

  frontend/
    src/
      components/
      hooks/
      pages/
      services/
      styles/
      types/
    package.json
```

## Domain Overview

The domain has two main point types:

```txt
client
pole
```

A `client` represents a customer location.

A `pole` represents an infrastructure point that clients can connect to.

The network generation flow is:

```txt
1. Load all points from the database
2. Separate clients and poles
3. For each client, find the nearest pole
4. Return a list of connections
5. Return the total network distance
```

Connections are generated in real time and are not stored in the database.

## Backend Architecture

The backend follows this flow:

```txt
Controller -> Service -> Repository -> Database
```

Responsibilities:

```txt
Controller: handles HTTP request and response
Service: contains business rules
Repository: isolates database access
Entity: describes database structure
Utils: pure reusable functions
```

Important decisions:

- TypeORM is isolated inside repositories
- Business rules stay inside services
- Controllers do not calculate domain logic
- Database schema is controlled by migrations
- `synchronize` is disabled
- Error responses are centralized

## Frontend Architecture

The frontend follows this structure:

```txt
components: visual UI pieces
hooks: state and user interaction orchestration
pages: screen composition
services: API communication
types: shared TypeScript contracts
styles: application CSS
```

The frontend is responsible for:

- Rendering the map
- Creating points through user interaction
- Calling backend endpoints
- Showing loading and error states
- Drawing points and network connections
- Displaying network metrics

The frontend is not responsible for:

- Calculating distances
- Deciding which pole is nearest
- Persisting connections
- Owning business rules

## Prerequisites

Before running the project, make sure you have:

- Node.js installed
- npm installed
- PostgreSQL running locally
- A database named `cadex_network`

The backend expects PostgreSQL with these default values:

```txt
host: localhost
port: 5432
user: cadex
password: cadex
database: cadex_network
```

You can override them through environment variables.

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=cadex
DB_PASSWORD=cadex
DB_NAME=cadex_network
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

There is already a sample file:

```txt
frontend/.env.example
```

## Running The Backend

Enter the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Run database migrations:

```bash
npm run migration:run
```

Start the backend:

```bash
npm run dev
```

The API will run at:

```txt
http://localhost:3000
```

## Running The Frontend

Enter the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

The application will run at:

```txt
http://localhost:5173
```

or:

```txt
http://127.0.0.1:5173
```

## Useful Scripts

### Backend

```bash
npm run dev
npm run build
npm run migration:generate
npm run migration:run
npm run migration:revert
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## API Summary

The complete API contract is available at:

```txt
backend/docs/api-contract.md
```

### POST /points

Creates a point.

Request:

```json
{
  "type": "client",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

Response:

```json
{
  "id": "4446c36e-982d-432e-aa80-dd36b3af644c",
  "type": "client",
  "latitude": -22.9068,
  "longitude": -43.1729,
  "createdAt": "2026-05-09T17:10:54.779Z",
  "updatedAt": "2026-05-09T17:10:54.779Z"
}
```

### GET /points

Lists all points.

Response:

```json
[
  {
    "id": "b776c49b-5703-452a-ae0a-700f13a05502",
    "type": "pole",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "createdAt": "2026-05-09T17:10:10.686Z",
    "updatedAt": "2026-05-09T17:10:10.686Z"
  }
]
```

### POST /network/generate

Generates the network from the points stored in the database.

Request body:

```txt
none
```

Response:

```json
{
  "connections": [
    {
      "clientId": "4446c36e-982d-432e-aa80-dd36b3af644c",
      "poleId": "e14b8e36-f533-425f-a17d-dfbdff995889",
      "distance": 224642.13
    }
  ],
  "totalDistance": 224642.13
}
```

Distances are returned in meters.

## Error Format

Application errors follow this structure:

```json
{
  "error": {
    "message": "Invalid point type",
    "code": "INVALID_POINT_TYPE",
    "statusCode": 400
  }
}
```

Unexpected errors follow this structure:

```json
{
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_SERVER_ERROR",
    "statusCode": 500
  }
}
```

## Main User Flow

1. Open the frontend
2. Select the point type: `client` or `pole`
3. Click on the map
4. Save the selected point
5. Repeat until there are clients and poles
6. Click `Generate network`
7. View connections on the map
8. Read total distance and connection metrics

## Frontend Features

- Interactive map
- Point creation by map click
- Client and pole visual differentiation
- Point list
- Network generation button
- Connection rendering with polylines
- Total distance metric
- Connection count
- Loading states
- Error messages

## Backend Features

- Point entity
- Point repository
- Point service
- Point API
- Error handling
- Distance utility
- Network generation service
- Network API
- Network metrics
- Edge case handling
- API contract documentation

## Validation Checklist

Before presenting the project, run:

```bash
cd backend
npm run build
```

```bash
cd ../frontend
npm run lint
npm run build
```

Then manually test:

```txt
POST /points
GET /points
POST /network/generate
```

In the frontend, test:

```txt
Create client
Create pole
Generate network
View connection line
View total distance
Refresh points
```

## Troubleshooting

### Backend cannot connect to database

Check if PostgreSQL is running.

The common error is:

```txt
ECONNREFUSED 127.0.0.1:5432
```

That means the backend could not reach PostgreSQL.

### Frontend shows request errors

Check if the backend is running at:

```txt
http://localhost:3000
```

Also check `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### Map does not load tiles

Check your internet connection. The map uses OpenStreetMap tiles.

### Network generation returns no poles error

Create at least one point with:

```json
{
  "type": "pole"
}
```

### Network generation returns empty connections

Create at least one point with:

```json
{
  "type": "client"
}
```

## Versioning Workflow

Recommended flow:

```txt
develop -> feature branch -> commits -> PR -> merge -> delete branch
```

Commit examples:

```txt
feat: cria interface do mapa
feat: integra frontend com api de pontos
feat: renderiza conexoes da rede
fix: corrige tratamento de erro no frontend
docs: documenta execucao do projeto
```

## Project Status

The MVP includes:

- Functional backend
- Versioned database schema
- Functional frontend
- Interactive map
- Point persistence
- Network generation
- Visual connection rendering
- Metrics panel
- API documentation

The project is ready for demonstration as a full-stack MVP.

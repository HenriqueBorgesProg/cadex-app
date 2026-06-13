# AGENTS.md

## Repo Shape

- This is not a root npm workspace: run npm commands from `backend/` or `frontend/`; each has its own `package-lock.json`.
- Backend entrypoints are `backend/src/server.ts` and `backend/src/app.ts`; routes are registered at `/points`, `/network`, and `/routes`.
- Frontend entrypoint is `frontend/src/main.tsx`; the app renders `NetworkOptimizerPage` through `frontend/src/App.tsx`.
- API contract details live in `backend/docs/api-contract.md`; keep frontend service/types changes aligned with it.

## Commands

- Backend: `cd backend && npm install`, `npm run dev`, `npm run build`, `npm run migration:run`, `npm run migration:revert`.
- Frontend: `cd frontend && npm install`, `npm run dev`, `npm run lint`, `npm run build`, `npm run preview`.
- Validation from the README: run `cd backend && npm run build`, then `cd frontend && npm run lint && npm run build`.
- There are currently no test scripts or test files; do not invent `npm test` as a verification step.

## Runtime Setup

- Backend defaults to PostgreSQL `localhost:5432`, user/password `cadex`, database `cadex_network`; override with `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in `backend/.env`.
- `docker-compose.yml` maps Postgres to host port `5433`; if running backend locally against the compose database, set `DB_PORT=5433`.
- Frontend reads `VITE_API_URL` from `frontend/.env` and defaults to `http://localhost:3000`; see `frontend/.env.example`.
- `docker-compose.yml` builds all services; the backend container runs `npm run migration:run && npm run dev` automatically.

## Architecture Constraints

- Backend should preserve `Controller -> Service -> Repository -> Database`; TypeORM access belongs in repositories and domain rules in services.
- TypeORM `synchronize` is disabled; schema changes require migrations under `backend/src/shared/database/migrations/`.
- Network generation is computed on demand and does not persist connections; route preview suggests poles and costs but does not persist suggested poles.
- Frontend should not calculate routes, nearest poles, pole suggestions, or costs; it sends requests and renders backend responses.

## External Dependencies

- Road routing uses the public OSRM API from `RoadRouteService` with the `walking` profile and retries; network/route behavior can fail or vary with internet/API availability.
- Map tiles come from OpenStreetMap via Leaflet, so manual UI checks need internet access.

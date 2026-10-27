# Todo

A small todo list used as the platform's sample app: a Next.js frontend and a NestJS +
TypeORM + PostgreSQL backend, built with Yarn. It exists to be put on the platform through
the golden path (onboarding form, shared pipeline, GitOps), so it follows the platform's
readiness rules and nothing else.

| | |
|---|---|
| `backend/` | NestJS 11 API: `GET/POST /todos`, `GET/PATCH/DELETE /todos/:id`, `GET /health`, `GET /health/readiness` |
| `frontend/` | Next.js 15 (App Router, standalone output); calls the API on its own origin under `/api` |

## Run it locally

```sh
docker compose up -d                                   # PostgreSQL on 127.0.0.1:5432
cd backend && yarn install && yarn build
DATABASE_URL=postgres://todo:todo@127.0.0.1:5432/todo yarn migration:run
DATABASE_URL=postgres://todo:todo@127.0.0.1:5432/todo yarn start:dev   # :3001
cd ../frontend && yarn install
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 yarn dev               # :3000
```

Checks, the same ones the pipeline runs in each folder:

```sh
yarn format:check && yarn lint && yarn typecheck && yarn test && yarn build
```

## Configuration (environment variables)

| Variable | Component | Required | Meaning |
|---|---|---|---|
| `DATABASE_URL` | backend | yes | PostgreSQL connection URL (secret) |
| `PORT` | backend | no (3001) | Listening port |
| `ALLOWED_ORIGINS` | backend | no | Comma-separated browser origins allowed by CORS; unset = no CORS (the gateway serves both on one origin) |
| `DB_LOGGING` | backend | no | `true` logs every query |
| `NEXT_PUBLIC_API_BASE_URL` | frontend, build time | no (`/api`) | Where the browser finds the API; only for local setups without a gateway |

## How it meets the readiness rules

- Health: `/health` (liveness, no dependencies) and `/health/readiness` (`SELECT 1`).
- Config only from environment variables; every optional variable has a default.
- Stateless: nothing in memory between requests, so any number of replicas.
- Migrations live in `backend/src/migrations`, compile to `dist/`, and run from the built
  image with plain `node` (`node node_modules/typeorm/cli.js migration:run -d dist/data-source.js`).
  The schema is never synchronised from entities.
- No environment-specific `NEXT_PUBLIC_*` values: the frontend calls `/api` on its own origin.
- SIGTERM closes the HTTP server and the database pool (`enableShutdownHooks`).

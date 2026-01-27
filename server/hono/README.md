# Hono + Drizzle foundation

Scaffold only. Not wired into the running Express app yet.

Next steps when ready to switch:
- Add Hono/Drizzle/PG deps to `server/package.json` and update lockfile.
- Point a new entry (or swap `index.js`) to `server/hono/server.ts`.
- Create migrations and move routes incrementally.

## Drizzle migrations

Config: `server/drizzle.config.ts`  
Env: `DATABASE_URL`

Commands (from repo root):
- `pnpm -C server db:generate -- --name=init`
- `pnpm -C server db:migrate`
- `pnpm -C server db:studio`
- `pnpm -C server db:push` (dev only)

Deploy: run `pnpm -C server db:migrate` in CI/release step (not on app startup).

## Local Postgres (Docker)

From repo root:
- `pnpm db:up` (or `docker compose up -d db`)
- Use `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/takashi_photos`
- `pnpm db:down` (keeps data) or `docker compose down -v` (reset)

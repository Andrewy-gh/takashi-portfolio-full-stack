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

## Cloudinary signed uploads + webhook

Env:
- `CLOUD_NAME`, `API_KEY`, `API_SECRET`
- Optional: `CLOUDINARY_NOTIFICATION_URL` (forces the upload notification URL)

Routes (when Hono is wired):
- `GET /api/cloudinary/config` -> `{ cloudName, apiKey }`
- `POST /api/cloudinary/signature` -> `{ signature, timestamp, apiKey, cloudName, params }`
- `POST /api/cloudinary/webhook` -> verifies Cloudinary notification signature and upserts `images`

## MongoDB -> Postgres migration (one-shot)

From repo root:
- Ensure `MONGODB_URI` + `DATABASE_URL` are set
- Run `pnpm -C server db:migrate:mongo`
- Optional output: `server/hono/scripts/mongo-image-order.json` (ordered Cloudinary IDs)

## Batch Cloudinary upload/import (one-shot)

Uploads a local folder to Cloudinary and inserts rows into Postgres.

From repo root:
- `pnpm -C server cloud:batch -- --dir "C:\\path\\to\\images"`

Options:
- `--cloud-folder "takashi"` (base folder in Cloudinary)
- `--category-mode top|full` (default: top-level folder)
- `--category-default "uncategorized"`
- `--concurrency 3`
- `--dry-run`
- `--no-db` (skip Postgres writes)

Report output: `server/hono/scripts/cloudinary-import-report.json`

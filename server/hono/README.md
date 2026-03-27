# Hono + Drizzle foundation

Hono is the current API runtime entrypoint.

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

Local dev tips:
- Use a public tunnel (ngrok) and set `CLOUDINARY_NOTIFICATION_URL` to `https://<tunnel>/api/cloudinary/webhook`.
- Or run `pnpm tunnel` from the repo root and copy the `CLOUDINARY_NOTIFICATION_URL=...` line it prints.
- Or set a Cloudinary upload preset with a `notification_url` pointing to your webhook.

## Auth (Better Auth)

Runtime env:
- `DATABASE_URL` (required)
- `BETTER_AUTH_SECRET` (preferred)
- `AUTH_JWT_SECRET` or `DASHBOARD_JWT_SECRET` can be reused as the Better Auth secret fallback to avoid a second production secret flip
- `BETTER_AUTH_URL` (optional but recommended outside localhost)
- `AUTH_SESSION_TTL_DAYS` (optional, default `7`, max `30`)

Admin bootstrap env:
- `AUTH_EMAIL` (or `DASHBOARD_EMAIL`)
- `AUTH_PASSWORD_HASH` (preferred) or `AUTH_PASSWORD` (dev only)
- These values are used to seed or repair the initial admin credential account when needed. They are not a separate runtime login path anymore.

Routes (mounted from Better Auth):
- `POST /api/auth/sign-in/email` -> validates email/password, sets session cookie, returns Better Auth sign-in payload
- `POST /api/auth/sign-out` -> clears the Better Auth session cookie
- `GET /api/auth/get-session` -> returns `{ session, user }` for an authenticated request or `401`

Admin utilities:
- Promote an existing user to admin:
- `pnpm -C server auth:promote-admin -- --email you@example.com`

Auth smoke test env:
- `API_BASE_URL` (optional, defaults to `http://localhost:3000`)
- `AUTH_SMOKE_EMAIL` + `AUTH_SMOKE_PASSWORD` (recommended)
- fallback credentials: `E2E_ADMIN_EMAIL` + `E2E_ADMIN_PASSWORD`
- final fallback credentials: `AUTH_EMAIL` + `AUTH_PASSWORD`

Smoke test:
- `pnpm -C server smoke:auth`
- verifies invalid sign-in, session sign-in, `get-session`, and sign-out

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

## Smoke Test (Local)

With `API_SECRET` set (and optional `API_BASE_URL`), run:
- `pnpm -C server smoke:api`

Expected output includes: `Smoke ok: webhook stored image`.

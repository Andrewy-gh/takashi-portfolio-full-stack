# Takashi Miyazaki

Portfolio web page for an international photographer.

**Link to live site:** https://takashi-photos.fly.dev

![alt tag](https://user-images.githubusercontent.com/17731837/264175251-732a9a1f-e474-4b0b-bd15-0ff0bfa80014.jpeg)

## How It's Made

**Frontend:** React + Vite (client + dashboard), Cloudinary  
**Backend:** Node.js + Hono, Postgres/Drizzle

This repo is a pnpm monorepo:
- `client/` = public portfolio site (read-only)
- `dashboard/` = admin UI for uploads + ordering
- `server/` = Hono API + Postgres

## Requirements

1. Cloudinary account (cloud name, API key, API secret)
2. Postgres database (connection string)
3. Admin auth env (`AUTH_EMAIL`, `AUTH_PASSWORD_HASH` or `AUTH_PASSWORD`)

## How to Run

1. Install deps from repo root:
   - `pnpm install`
2. Copy `server/.env.example` to `server/.env` and fill required values.
   - Optional: `client/.env.example` -> `client/.env.local`
   - Optional: `dashboard/.env.example` -> `dashboard/.env.local`
3. Start Postgres and run migrations:
   - `pnpm db:up`
   - `pnpm -C server db:migrate`
4. Start dev servers:
   - `pnpm -C server dev`
   - `pnpm -C client dev`
   - `pnpm -C dashboard dev`

## Usage

- Sign in at `dashboard` (`/sign-in`) with admin credentials.
- Upload images in the dashboard; uploads use Cloudinary signed uploads and webhook callbacks.
- Order images per category in the dashboard.

## Multiple Dev Environments

Use env overrides per instance (shell or per-app `.env.local`):
- DB port + name (Docker):
  - `DB_PORT=5433 DB_NAME=takashi_photos_dev2 docker compose -p takashi-dev2 up -d db`
- Server port + DB URL:
  - `PORT=3001 DATABASE_URL=postgresql://postgres:postgres@localhost:5433/takashi_photos_dev2 pnpm -C server dev`
- Client/dashboard API target:
  - `VITE_API_BASE_URL=http://localhost:3001 pnpm -C dashboard dev -- --port 5174`
  - `VITE_API_BASE_URL=http://localhost:3001 pnpm -C client dev -- --port 5175`
- CORS allowlist:
  - `CORS_ORIGINS=http://localhost:5174,http://localhost:5175`

## Optional Smoke Test

With `API_SECRET` set (`API_BASE_URL` optional, defaults to `http://localhost:3000`):
- `pnpm -C server smoke:api`

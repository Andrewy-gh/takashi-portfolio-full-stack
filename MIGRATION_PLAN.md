# Monorepo Refactor Draft Plan

This is a living checklist. When an agent completes a task, mark it as done with "[x]".

## Purpose / End State

Convert this repo into a pnpm monorepo with TypeScript across apps, a Node + Hono API backed by Postgres/Drizzle, a read-only portfolio frontend (React + Vite + MUI) that fetches image data from the API, and a separate dashboard frontend (based on AB Dashboard v2) for admin image management. Media storage uses Cloudinary with signed uploads and webhook callbacks. Migration is a one-time MongoDB -> Postgres import plus a batch Cloudinary upload/import script.

## Template Reference

AB Dashboard v2 repo is located one level up at `C:\E\2026\ab-dashboard-v2`.

## High-level Tasks

- [x] Monorepo scaffold with pnpm workspaces
- [x] TypeScript baseline and shared tooling
- [x] Hono API + Postgres/Drizzle foundation (scaffold only; deps/wiring later)
- [x] Drizzle migrations setup + baseline schema
- [x] Cloudinary signed upload + webhook flow
- [x] MongoDB -> Postgres one-shot data migration
- [x] Batch Cloudinary upload/import script
- [x] Portfolio frontend (React + Vite + MUI) TS migration and read-only cleanup
- [x] Dashboard frontend integration (AB dashboard v2)
- [x] Auth (simple login with future provider flexibility)
- [ ] Fly deployment + environment strategy

## Notes / Constraints

- Backend runtime: Node + Hono
- Database: Postgres with Drizzle
- Media: Cloudinary with signed uploads and webhook callbacks
- Portfolio remains client-rendered and fetches from API (not fully static)
- Dashboard uses AB v2 frontend stack as-is
- Migration: one-time Mongo import; no dual-write period

## Drizzle Migrations Setup (Plan)

- [x] Add deps (server): `drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`
- [x] Create `server/drizzle.config.ts` (or `server/hono/drizzle.config.ts`) with:
  - schema path: `server/hono/schema.ts`
  - out dir: `server/hono/migrations`
  - driver: `pg`
  - db creds via env (DATABASE_URL or host/user/pass)
- [x] Add server scripts:
  - `db:generate` => `drizzle-kit generate`
  - `db:migrate` => `drizzle-kit migrate`
  - `db:studio` => `drizzle-kit studio`
- [x] Create first migration from current Drizzle schema (baseline)
- [x] Add migration runner for prod (Hono boot step or separate CLI)
- [x] Add `db:push` (dev only) if needed; avoid in prod
- [x] Document env vars + local flow in `server/hono/README.md`
- [x] Decide migration ownership in deploy (CI step vs app startup)

## Handoff Notes (Jan 27, 2026)

- Added Hono/Drizzle scaffold (not wired): `server/hono/*` (app/server/db/schema + README).
- Dockerfile tightened to avoid copying host `node_modules`/`.env` and to copy only runtime server sources.
- Tasks discussed (not implemented): finalize Drizzle schema w/ categories + image ordering table; decide ordering mode (custom vs created_at/title); drop Config table; add width/height + rename `cloudinary_id`.
- Full gate not run after recent changes.
- Suggested next commit message: `chore: add hono scaffold and refine docker build`

## Drizzle Schema Note (Proposed)

Tables:
- `categories`: id (uuid pk), name (text unique), slug (text unique), sort_mode (text default "custom")
- `images`: id (uuid pk), title (text), url (text), category (text nullable), cloudinary_id (text unique), width (int), height (int), created_at, updated_at
- `image_categories`: image_id (fk), category_id (fk), unique(image_id, category_id)
- `image_order`: image_id (fk), category_id (fk nullable for home/global), position (int), unique(category_id, position), unique(category_id, image_id)
- `users`: id (uuid pk), email (text unique), password_hash (text), role (text)

Notes:
- `image_order.category_id` nullable => global/home ordering.
- `sort_mode` values: `custom|created_at|title|cloudinary` (dash to be finalized).
- Config table to be removed; use migrations/seeds instead.

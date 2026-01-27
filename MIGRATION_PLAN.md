# Monorepo Refactor Draft Plan

This is a living checklist. When an agent completes a task, mark it as done with "[x]".

## Purpose / End State

Convert this repo into a pnpm monorepo with TypeScript across apps, a Node + Hono API backed by Postgres/Drizzle, a read-only portfolio frontend (React + Vite + MUI) that fetches image data from the API, and a separate dashboard frontend (based on AB Dashboard v2) for admin image management. Media storage uses Cloudinary with signed uploads and webhook callbacks. Migration is a one-time MongoDB -> Postgres import plus a batch Cloudinary upload/import script.

## Template Reference

AB Dashboard v2 repo is located one level up at `C:\E\2026\ab-dashboard-v2`.

## High-level Tasks

- [x] Monorepo scaffold with pnpm workspaces
- [x] TypeScript baseline and shared tooling
- [ ] Hono API + Postgres/Drizzle foundation
- [ ] Cloudinary signed upload + webhook flow
- [ ] MongoDB -> Postgres one-shot data migration
- [ ] Batch Cloudinary upload/import script
- [ ] Portfolio frontend (React + Vite + MUI) TS migration and read-only cleanup
- [ ] Dashboard frontend integration (AB dashboard v2)
- [ ] Auth (simple login with future provider flexibility)
- [ ] Fly deployment + environment strategy

## Notes / Constraints

- Backend runtime: Node + Hono
- Database: Postgres with Drizzle
- Media: Cloudinary with signed uploads and webhook callbacks
- Portfolio remains client-rendered and fetches from API (not fully static)
- Dashboard uses AB v2 frontend stack as-is
- Migration: one-time Mongo import; no dual-write period

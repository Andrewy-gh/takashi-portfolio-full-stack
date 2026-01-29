# Deployment (Fly + Env Strategy)

## Fly API (server)

- Config: `server/fly.toml`
- Deploy from repo root so Docker can copy `client/`:
  - `fly deploy --config server/fly.toml --dockerfile server/Dockerfile`
- Release step (Fly `release_command`): `pnpm -C server db:migrate`

## API env (Fly secrets)

Required (runtime):
- `DATABASE_URL`
- `CLOUD_NAME`, `API_KEY`, `API_SECRET`
- `AUTH_JWT_SECRET` (or `DASHBOARD_JWT_SECRET`)
- `AUTH_EMAIL` (or `DASHBOARD_EMAIL`)
- `AUTH_PASSWORD_HASH` (prefer) or `AUTH_PASSWORD` (dev only)

Optional:
- `CLOUDINARY_NOTIFICATION_URL`

One-shot scripts only (local):
- `MONGODB_URI`
- `IMAGE_IMPORT_DIR`

## Frontend env (Vite build-time)

`client`:
- `VITE_API_BASE_URL` (optional; defaults to Fly prod URL)
- `VITE_CLOUDINARY_CLOUD_NAME` (optional fallback)

`dashboard`:
- `VITE_API_BASE_URL` (optional; defaults to same origin)

Notes:
- Only `VITE_*` values are exposed to frontend bundles.
- Keep API secrets in Fly secrets (not in Vite env files).

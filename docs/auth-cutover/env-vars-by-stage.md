# Env Variables by Stage

## Stage 0: Prep (Lead)
- Required existing env:
- `DATABASE_URL`
- Existing Cloudinary envs unchanged
- New env required:
- none

## Stage 1: Backend Better Auth Foundation (Agent A)
- Required new env:
- `BETTER_AUTH_SECRET` (mandatory)
- `BETTER_AUTH_URL` (mandatory)
- Required existing env:
- `DATABASE_URL`
- Recommended:
- `CORS_ORIGINS` updated to include dashboard origin
- Optional (only if configured):
- provider-specific OAuth vars
- SMTP vars for email flows

## Stage 2: Dashboard Session Integration (Agent B)
- Required existing env:
- `VITE_API_BASE_URL` if cross-origin
- Required new env:
- none beyond Stage 1 backend values
- Remove usage (code path, not necessarily env deletion yet):
- `AUTH_EMAIL`
- `AUTH_PASSWORD` / `AUTH_PASSWORD_HASH`
- `DASHBOARD_EMAIL`
- `DASHBOARD_PASSWORD` / `DASHBOARD_PASSWORD_HASH`
- `AUTH_JWT_SECRET` / `DASHBOARD_JWT_SECRET`

## Stage 3: E2E/Test Alignment (Agent C)
- Required for e2e login path:
- Better Auth test user credentials (project-specific naming)
- `E2E_API_BASE_URL` (if not localhost)
- Keep:
- `API_SECRET` or `CLOUDINARY_API_SECRET` for webhook tests

## Stage 4: Cutover + Legacy Removal (Agent D)
- Runtime required:
- `AUTH_MODE=better_only`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `DATABASE_URL`
- Decommission (delete from environments after stable release):
- `AUTH_EMAIL`
- `AUTH_PASSWORD`
- `AUTH_PASSWORD_HASH`
- `DASHBOARD_EMAIL`
- `DASHBOARD_PASSWORD`
- `DASHBOARD_PASSWORD_HASH`
- `AUTH_JWT_SECRET`
- `DASHBOARD_JWT_SECRET`

## Stage 5: Post-Cutover Hardening (Lead)
- Optional additions:
- password reset email vars
- MFA-related vars if provider added
- audit logging sink vars (if implemented)

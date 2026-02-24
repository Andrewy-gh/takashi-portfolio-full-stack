# Agent A Plan: Backend Better Auth Foundation

## Branch + PR
- Create branch:
- `git checkout -b feat/auth-better-auth-backend-foundation`
- Commit style:
- `feat(server): integrate better-auth foundation`
- Open PR into `main`
- Before requesting review run:
- `gh pr diff`
- `gh pr view`

## Mission
Implement Better Auth on the server without breaking existing dashboard usage during transition.

## Files In Scope
- `server/package.json`
- `server/hono/app.ts`
- `server/hono/routes/auth.ts`
- `server/hono/auth-utils.ts`
- `server/hono/schema.ts`
- `server/hono/migrations/*`
- `server/hono/README.md`
- optional bootstrap script: `server/hono/scripts/*`

## Required Tasks
1. Add Better Auth dependencies in `server/package.json`.
2. Implement Better Auth server wiring under `/api/auth/*` in `server/hono/routes/auth.ts` and mount in `server/hono/app.ts`.
3. Introduce session/role extraction helper replacing direct JWT env token verification in `server/hono/auth-utils.ts`.
4. Preserve temporary compatibility mode:
- if `AUTH_MODE=dual`, allow old bearer path
- if `AUTH_MODE=better_only`, require Better Auth session
5. Add/adjust Drizzle schema + migration files required by Better Auth.
6. Add admin bootstrap command/script:
- promote an existing user to `role=admin`
- no env-password dependency
7. Update server auth docs in `server/hono/README.md`.

## API Contract to Expose for Agent B
- Reliable auth check endpoint for dashboard route guard, either:
- Better Auth session endpoint, or
- compatibility `/api/auth` response: `{ ok, sub, role }`
- Definitive unauthenticated code: `401`
- Definitive unauthorized code: `403`

## Acceptance Criteria
- Server compiles: `pnpm -C server typecheck`
- In `AUTH_MODE=dual`:
- Better Auth session works
- legacy bearer flow still works
- In `AUTH_MODE=better_only`:
- legacy bearer path blocked
- Better Auth session path works
- Admin bootstrap script documented and runnable

## Risks to Watch
- CORS+credentials mismatch for cross-origin dashboard
- cookie domain/sameSite in local vs prod
- accidental breakage of existing `/api/images`, `/api/categories`, `/api/cloudinary` auth guards

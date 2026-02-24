# Auth Contract for Parallel Work

## Goal
Replace env-variable dashboard login with Better Auth session-based auth, with a safe staged rollout and no admin lockout.

## Current Auth Snapshot
- Dashboard stores token in localStorage: `dashboard/src/auth.tsx`
- Dashboard attaches `Authorization: Bearer <token>`: `dashboard/src/lib/api.ts`
- Sign-in posts to `/api/auth/login`: `dashboard/src/routes/sign-in.tsx`
- Server env login/jwt implementation: `server/hono/routes/auth.ts`
- Server admin token helper: `server/hono/auth-utils.ts`
- Protected APIs using `requireAdmin`:
- `server/hono/routes/images.ts`
- `server/hono/routes/categories.ts`
- `server/hono/routes/cloudinary.ts`

## Target Auth Model
- Better Auth endpoint mounted under `/api/auth/*`
- Session-first authentication (cookie/session), no dashboard localStorage token
- Server authorization policy:
- authenticated user required
- `role=admin` required for dashboard write APIs
- temporary dual-mode optional via `AUTH_MODE=dual|better_only`

## Compatibility Window
- `dual` mode:
- Better Auth session accepted
- legacy bearer token accepted (short window)
- `better_only` mode:
- Better Auth session required
- legacy env login endpoints removed

## Shared Data Contract
- Canonical auth state in dashboard context:
- `user: { id: string; email: string; role: string } | null`
- `status: 'loading' | 'authenticated' | 'unauthenticated'`
- `actions: { signIn, signOut, refresh }`

## Role Contract
- Allowed role for dashboard APIs: `admin`
- Non-admin response: HTTP `403`
- Unauthenticated response: HTTP `401`

## Database Contract
- Preserve existing `users` table semantics unless migration explicitly changes ownership
- If Better Auth adds required tables, generate Drizzle migration under `server/hono/migrations`
- Admin bootstrap must exist outside env password path

## File Ownership Boundaries
- Agent A owns:
- `server/hono/app.ts`
- `server/hono/routes/auth.ts`
- `server/hono/auth-utils.ts`
- `server/hono/schema.ts`
- `server/hono/migrations/*`
- `server/package.json`
- Agent B owns:
- `dashboard/src/auth.tsx`
- `dashboard/src/lib/api.ts`
- `dashboard/src/routes/sign-in.tsx`
- `dashboard/src/routes/_auth.tsx`
- `dashboard/src/components/app-sidebar.tsx`
- Agent C owns:
- `dashboard/e2e/*`
- `dashboard/playwright.config.ts` (if needed)
- docs and runbook alignment files
- Agent D owns:
- legacy auth code removal across server+dashboard
- env example/docs final cleanup

## Non-Negotiables
- No push from automation session
- Each agent creates a dedicated branch and PR
- Use `gh pr diff` before merge to confirm scope
- No direct edits to another agent's owned files without explicit handoff

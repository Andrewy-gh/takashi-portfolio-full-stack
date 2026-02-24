# Agent B Plan: Dashboard Better Auth Integration

## Branch + PR
- Create branch:
- `git checkout -b feat/dashboard-better-auth-session-flow`
- Commit style:
- `feat(dashboard): migrate to better-auth session flow`
- Open PR into `main`
- Before requesting review run:
- `gh pr diff`
- `gh pr view`

## Mission
Replace localStorage bearer-token login with Better Auth session flow in the dashboard app.

## Files In Scope
- `dashboard/src/auth.tsx`
- `dashboard/src/lib/api.ts`
- `dashboard/src/routes/sign-in.tsx`
- `dashboard/src/routes/_auth.tsx`
- `dashboard/src/components/app-sidebar.tsx`
- `dashboard/src/app.tsx` (only if context contract changes)

## Required Tasks
1. Replace token storage in `dashboard/src/auth.tsx` with session-driven state.
2. Remove localStorage bearer injection in `dashboard/src/lib/api.ts`.
3. Update auth-check logic in `dashboard/src/routes/_auth.tsx` to use session validation endpoint/SDK.
4. Update sign-in flow in `dashboard/src/routes/sign-in.tsx` to Better Auth client sign-in.
5. Update logout path in `dashboard/src/components/app-sidebar.tsx` to Better Auth sign-out.
6. Keep UX behavior:
- successful sign-in -> redirect to `/`
- invalid creds -> user-friendly message + toast
- expired session -> redirect to `/sign-in`

## Non-Goals
- No server migration edits
- No e2e refactor outside tiny selector or flow fixes

## Acceptance Criteria
- Dashboard compiles: `pnpm -C dashboard typecheck`
- No reference to `takashi.dashboard.token`
- No manual `Authorization: Bearer` header from dashboard runtime auth path
- Route guard still blocks unauthenticated users

## Dependency
- Consume Agent A's documented auth contract exactly; do not invent endpoint shapes.

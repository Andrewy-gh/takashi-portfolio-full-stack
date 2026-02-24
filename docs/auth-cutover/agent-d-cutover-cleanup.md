# Agent D Plan: Final Cutover + Legacy Removal

## Branch + PR
- Create branch:
- `git checkout -b chore/auth-cutover-remove-env-login`
- Commit style:
- `chore(auth): remove legacy env login path`
- Open PR into `main`
- Before requesting review run:
- `gh pr diff`
- `gh pr view`

## Mission
Perform the irreversible cleanup only after A+B+C are merged and staging is green.

## Preconditions
- Agent A, B, C PRs merged
- staging tested with `AUTH_MODE=dual`
- admin bootstrap path verified

## Files In Scope
- `server/hono/routes/auth.ts`
- `server/hono/auth-utils.ts`
- `server/hono/README.md`
- `dashboard/src/*` any residual legacy references
- root docs/env examples where legacy env vars are listed

## Required Tasks
1. Flip runtime mode to Better Auth only (`AUTH_MODE=better_only`).
2. Remove legacy `/api/auth/login` env-password code path.
3. Remove legacy JWT secret and dashboard password/email env usages in code.
4. Clean residual dashboard local token compatibility code if any remains.
5. Update all docs to remove env-login instructions.
6. Publish final env decommission checklist in docs.

## Acceptance Criteria
- Search for legacy env auth vars in runtime code returns none:
- `AUTH_EMAIL`, `DASHBOARD_EMAIL`
- `AUTH_PASSWORD`, `DASHBOARD_PASSWORD`
- `AUTH_PASSWORD_HASH`, `DASHBOARD_PASSWORD_HASH`
- `AUTH_JWT_SECRET`, `DASHBOARD_JWT_SECRET`
- auth still works for admin dashboard users via Better Auth session

## Rollback
- If prod issue, revert this PR and keep `dual` mode until fix.

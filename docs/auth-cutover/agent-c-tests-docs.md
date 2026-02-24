# Agent C Plan: E2E + Regression + Docs Alignment

## Branch + PR
- Create branch:
- `git checkout -b test/auth-cutover-regressions-and-docs`
- Commit style:
- `test(dashboard): add auth cutover regressions`
- Open PR into `main`
- Before requesting review run:
- `gh pr diff`
- `gh pr view`

## Mission
Update tests and documentation so auth cutover is verified and reproducible.

## Files In Scope
- `dashboard/e2e/cloudinary-webhook.spec.ts`
- `dashboard/e2e/category-delete-home.spec.ts`
- `dashboard/e2e/*` where auth helper logic is duplicated
- `dashboard/e2e/helpers/artifacts.ts`
- `dashboard/README.md`
- `docs/auth-cutover/*` (if contract clarifications needed)

## Required Tasks
1. Introduce a shared e2e auth helper for Better Auth login/session bootstrapping.
2. Remove hard dependency on env-password login endpoint for e2e setup.
3. Keep Cloudinary test prerequisites unchanged (`API_SECRET`/`CLOUDINARY_API_SECRET`).
4. Add at least one new regression:
- expired or invalid session redirects to `/sign-in`
5. Keep existing category delete regression passing with new auth flow.
6. Document e2e env setup for Better Auth in `dashboard/README.md`.

## Acceptance Criteria
- `pnpm -C dashboard test:e2e` passes in configured env
- No test references `/api/auth/login` legacy endpoint
- New regression clearly fails on old behavior and passes after cutover

## Notes
- If `AUTH_MODE=dual`, test both session path and forbidden/non-admin behavior.

# Kickoff Prompt: Agent C (Tests + Docs)

Copy/paste this prompt into Agent C.

```md
You are Agent C on Codex 5.3 (medium thinking).

Mission:
Update e2e/regression tests and docs for Better Auth cutover.

Branch:
- Create branch `test/auth-cutover-regressions-and-docs`

Read first:
- `docs/auth-cutover/contract.md`
- `docs/auth-cutover/env-vars-by-stage.md`
- `docs/auth-cutover/agent-c-tests-docs.md`

Files in scope:
- `dashboard/e2e/*.spec.ts`
- `dashboard/e2e/helpers/*`
- `dashboard/playwright.config.ts` (if needed)
- `dashboard/README.md`
- `docs/auth-cutover/*` for clarifications

Required deliverables:
1. Centralize e2e auth setup helper for Better Auth sessions.
2. Remove legacy dependency on `/api/auth/login` in tests.
3. Keep webhook-related env handling unchanged (`API_SECRET`/`CLOUDINARY_API_SECRET`).
4. Add regression for expired/invalid session redirect to `/sign-in`.
5. Keep category-delete-home regression aligned with new auth flow.
6. Document required e2e env vars in `dashboard/README.md`.

Hard constraints:
- No backend auth implementation edits.
- Avoid broad flaky changes unrelated to auth.

Validation commands:
- `pnpm -C dashboard test:e2e`

Commit:
- Conventional Commit example: `test(dashboard): add auth cutover regressions`

PR:
- Open PR to `main`.
- Before review, run `gh pr diff` and `gh pr view`.
- Include: scope, risks, rollback notes, commands executed.

Output at handoff:
- changed files list
- e2e env requirements
- new/updated regression scenarios
```

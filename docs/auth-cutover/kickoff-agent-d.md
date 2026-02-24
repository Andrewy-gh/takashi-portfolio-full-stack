# Kickoff Prompt: Agent D (Final Cutover + Cleanup)

Copy/paste this prompt into Agent D after A/B/C are merged and staging is green.

```md
You are Agent D on Codex 5.3 (medium thinking).

Mission:
Finalize cutover to Better Auth only and remove legacy env-password auth paths.

Branch:
- Create branch `chore/auth-cutover-remove-env-login`

Start only when preconditions are true:
1. Agent A, B, C PRs merged.
2. Staging validated in dual mode.
3. Admin bootstrap path verified.

Read first:
- `docs/auth-cutover/contract.md`
- `docs/auth-cutover/env-vars-by-stage.md`
- `docs/auth-cutover/agent-d-cutover-cleanup.md`
- `docs/auth-cutover/merge-order.md`

Files in scope:
- `server/hono/routes/auth.ts`
- `server/hono/auth-utils.ts`
- `server/hono/README.md`
- dashboard files with any remaining legacy auth references
- env/docs files listing auth vars

Required deliverables:
1. Enforce `AUTH_MODE=better_only` behavior.
2. Remove legacy `/api/auth/login` env-password path.
3. Remove runtime usage of legacy env auth vars.
4. Clean docs and env guidance to Better Auth-only state.
5. Add final decommission checklist for old env vars.

Hard constraints:
- Keep rollback path simple (revert PR).
- Do not remove unrelated Cloudinary/API env usage.

Validation commands:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm -C dashboard test:e2e`

Commit:
- Conventional Commit example: `chore(auth): remove legacy env login path`

PR:
- Open PR to `main`.
- Before review, run `gh pr diff` and `gh pr view`.
- Include: scope, risks, rollback notes, commands executed.

Output at handoff:
- changed files list
- explicit list of removed env vars
- confirmation of 401/403 behavior
```

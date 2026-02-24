# Kickoff Prompt: Agent A (Backend Foundation)

Copy/paste this prompt into Agent A.

```md
You are Agent A on Codex 5.3 (medium thinking).

Mission:
Implement Better Auth backend foundation with safe dual-mode compatibility.

Branch:
- Create branch `feat/auth-better-auth-backend-foundation`

Read first:
- `docs/auth-cutover/contract.md`
- `docs/auth-cutover/env-vars-by-stage.md`
- `docs/auth-cutover/agent-a-backend.md`

Files in scope:
- `server/package.json`
- `server/hono/app.ts`
- `server/hono/routes/auth.ts`
- `server/hono/auth-utils.ts`
- `server/hono/schema.ts`
- `server/hono/migrations/*`
- `server/hono/README.md`
- optional bootstrap script under `server/hono/scripts/*`

Required deliverables:
1. Add Better Auth dependencies and server wiring under `/api/auth/*`.
2. Implement role/session extraction in `auth-utils`.
3. Add `AUTH_MODE=dual|better_only` compatibility behavior.
4. Add needed Drizzle migration(s) for auth tables.
5. Add admin bootstrap command/script to promote user role without env-password path.
6. Document setup and envs in `server/hono/README.md`.

Hard constraints:
- Keep existing protected routes working (`images`, `categories`, `cloudinary`).
- Preserve 401 for unauthenticated, 403 for non-admin.
- Do not remove legacy env login path yet if `AUTH_MODE=dual`.

Validation commands:
- `pnpm -C server typecheck`

Commit:
- Conventional Commit example: `feat(server): integrate better-auth foundation`

PR:
- Open PR to `main`.
- Before review, run `gh pr diff` and `gh pr view`.
- Include: scope, risks, rollback notes, commands executed.

Output at handoff:
- changed files list
- env vars required now
- exact behavior in `dual` vs `better_only`
```

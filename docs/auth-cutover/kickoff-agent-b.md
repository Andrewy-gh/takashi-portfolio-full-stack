# Kickoff Prompt: Agent B (Dashboard Integration)

Copy/paste this prompt into Agent B.

```md
You are Agent B on Codex 5.3 (medium thinking).

Mission:
Migrate dashboard auth from localStorage bearer token to Better Auth session flow.

Branch:
- Create branch `feat/dashboard-better-auth-session-flow`

Read first:
- `docs/auth-cutover/contract.md`
- `docs/auth-cutover/env-vars-by-stage.md`
- `docs/auth-cutover/agent-b-dashboard.md`

Files in scope:
- `dashboard/src/auth.tsx`
- `dashboard/src/lib/api.ts`
- `dashboard/src/routes/sign-in.tsx`
- `dashboard/src/routes/_auth.tsx`
- `dashboard/src/components/app-sidebar.tsx`
- `dashboard/src/app.tsx` only if auth context contract needs update

Required deliverables:
1. Replace token state in `auth.tsx` with session-first auth state.
2. Remove manual bearer header injection in `lib/api.ts`.
3. Switch sign-in route to Better Auth sign-in client call.
4. Route guard uses session validation and role check contract from backend.
5. Update sign-out flow to Better Auth sign-out.
6. Preserve UX: successful login redirect, friendly invalid creds message, expired session redirect to `/sign-in`.

Hard constraints:
- No server auth route changes.
- Do not reintroduce localStorage token.
- Keep existing dashboard route behavior stable.

Validation commands:
- `pnpm -C dashboard typecheck`

Commit:
- Conventional Commit example: `feat(dashboard): migrate to better-auth session flow`

PR:
- Open PR to `main`.
- Before review, run `gh pr diff` and `gh pr view`.
- Include: scope, risks, rollback notes, commands executed.

Output at handoff:
- changed files list
- any backend contract dependency blockers
- auth flow summary from sign-in to protected route
```

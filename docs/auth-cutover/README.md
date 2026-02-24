# Better Auth Cutover Orchestration

## Team Shape
- `Lead` orchestrator (integration + merge + release owner)
- `Agent A` backend foundation + auth middleware
- `Agent B` dashboard auth client integration
- `Agent C` e2e/tests/docs alignment
- `Agent D` final cutover + legacy removal + env cleanup

## Recommended Count
- `4 implementation agents` + `1 lead`
- Why: backend/client/tests can run in parallel; cleanup is safer isolated in a final stage.

## Parallel vs Sequential
- Parallel now:
- `Agent A`, `Agent B`, `Agent C`
- Sequential later:
- `Agent D` only after A+B+C merged and staging green

## Entry Conditions
- Base branch: `main`
- Repo package manager: `pnpm`
- All agents follow Conventional Commits
- PR inspection command policy: use `gh pr view` and `gh pr diff` only

## Exit Conditions
- Env-password auth removed from runtime paths
- Dashboard uses Better Auth session flow
- Admin authorization enforced server-side
- Full gate run before handoff: `pnpm lint`, `pnpm typecheck`, `pnpm -C dashboard test:e2e`

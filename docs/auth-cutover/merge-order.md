# Merge and Release Order

## Phase 1: Parallel Build
1. Agent A opens backend foundation PR.
2. Agent B opens dashboard integration PR (draft until A contract is stable).
3. Agent C opens tests/docs PR (draft until A+B API/session contract stable).

## Phase 2: Deterministic Merge
1. Merge Agent A first.
2. Rebase Agent B onto `main`, resolve contract mismatches, merge.
3. Rebase Agent C onto `main`, update tests, merge.

## Phase 3: Staging Cutover
1. Set `AUTH_MODE=dual` in staging.
2. Run full gate:
- `pnpm lint`
- `pnpm typecheck`
- `pnpm -C dashboard test:e2e`
3. Manual checks:
- sign-in success
- sign-out success
- unauthorized -> `/sign-in`
- non-admin blocked with `403`

## Phase 4: Final Cleanup
1. Agent D opens cleanup PR.
2. Merge Agent D.
3. Set `AUTH_MODE=better_only`.
4. Remove deprecated env vars from deployment secrets.

## Required Environment at Each Phase
- See detailed matrix: `docs/auth-cutover/env-vars-by-stage.md`

## PR Hygiene Rules
- Every PR must include:
- scope summary
- risks
- rollback notes
- executed commands
- Use only `gh pr view` and `gh pr diff` for PR inspection.

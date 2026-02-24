# Kickoff Master

Use these prompts to launch parallel Codex 5.3 medium-thinking agents.

## Agent Count
- Run `4` implementation agents in parallel: `A`, `B`, `C`, `D`.
- Sequencing: start `A/B/C` now; start `D` only after `A/B/C` merged + staging green.

## Launch Order
1. Agent A prompt: `docs/auth-cutover/kickoff-agent-a.md`
2. Agent B prompt: `docs/auth-cutover/kickoff-agent-b.md`
3. Agent C prompt: `docs/auth-cutover/kickoff-agent-c.md`
4. Agent D prompt: `docs/auth-cutover/kickoff-agent-d.md` (delayed)

## Shared Context Files
- `docs/auth-cutover/contract.md`
- `docs/auth-cutover/env-vars-by-stage.md`
- `docs/auth-cutover/merge-order.md`

## PR Hygiene
- Every agent creates its own branch.
- Every agent opens PR to `main`.
- Use `gh pr diff` and `gh pr view` for PR inspection.
- Do not push from this local automation session.

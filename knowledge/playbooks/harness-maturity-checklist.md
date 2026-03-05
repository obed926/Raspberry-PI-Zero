# Harness Maturity Checklist

Use this checklist to grade project harness quality and decide next upgrades.

## Level 1: Baseline (single-team reliability)

1. deterministic chain of command is documented
2. startup docs are slim and current
3. hooks enforce bash/edit/task guardrails
4. core CI validation is green
5. memory retention and checkpoint protocols are active

## Level 2: Managed (multi-team control)

1. router + team PM boundaries are explicit
2. command-center map is canonical and diagram is synced
3. spec-first gate is active for non-trivial tasks
4. Opus escalation gate is enforced
5. incident response + lessons loop are operating

## Level 3: Scaled (org-grade operations)

1. stack-level baseline rules exist per major tech family
2. MCP inventory has owner/scope/fallback and idle pruning
3. role-specific skills are modular and versioned
4. independent QA/specialist review lanes are measured
5. token/cost trends and phase-budget policy are reviewed weekly

## Review Cadence

1. run monthly or after major architecture changes
2. log current level in `docs/DECISIONS.md`
3. open tasks for unmet controls in `ops-tracker.md`

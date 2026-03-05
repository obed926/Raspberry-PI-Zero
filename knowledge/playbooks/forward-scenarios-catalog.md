# Forward Scenarios Catalog

Date: 2026-02-16

Purpose: baseline scenario set every project should evaluate during pre-mortem scans.

## Scenario Matrix

| ID | Scenario | Early Signal | Preventive Control | Verification |
|----|----------|--------------|--------------------|--------------|
| FS-001 | Opus overuse on routine tasks | cost_usd trend increases while task complexity stays flat | Default model stays `sonnet`; Opus only by explicit escalation criteria and `opus-escalation-gate.sh` | Check `registry/models.yaml`, `ops-tracker.md` (`OPUS_APPROVED`), and task logs |
| FS-002 | Always-on multi-agent fan-out burns tokens | 5+ agents active for simple tasks; repeated duplicate findings | Keep one-PM default; limit concurrent active agents | Review `knowledge/agent-logs/agent-runs.csv` per task |
| FS-003 | Context bloat causes instability/crashes | oversized local transcripts/debug files; repeated runtime errors | enforce context hygiene + transcript cleanup policy | inspect local runtime sizes and crash logs |
| FS-004 | Hook policy drifts back to prompt-heavy gates | prompt hooks reappear; stop-hook token overhead rises | keep command-only hooks + QA invariants | run `scripts/qa-scaffold-consistency.sh` |
| FS-005 | Bash guard bypass reappears | dangerous command forms pass pretool checks | maintain regression tests (`-f`, redirection, operator cases) | run `scripts/validate-bash-guard.sh` |
| FS-006 | PM starts doing worker tasks again | PM dispatch includes shell steps or checklists | enforce objective-only PM dispatch contract | run `scripts/validate-pm-dispatch-guard.sh` |
| FS-007 | MCP overhead grows silently | many enabled MCPs with low usage | disable unused MCPs; lower tool-search threshold | compare enabled MCPs vs actual usage logs |
| FS-008 | Docs and scaffold behavior diverge | onboarding copies stale snippets; mismatched settings | consistency checks + docs updates in same PR | run smoke + consistency checks before push |
| FS-009 | Self-hosted runtime exposed by weak network/auth defaults | gateway bound beyond loopback without strong auth; permissive DM/group policy; weak local file perms | enforce loopback-or-private-network binding, mandatory gateway auth token/password, allowlist-first messaging policy, and strict local perms for config/credentials/session files | run runtime security audit command + check bind/auth/policy/perms in config and host firewall |

## Use Rule

At each forward scan, mark each scenario as:

1. `stable`
2. `at-risk`
3. `active-incident`

Escalate `at-risk` or `active-incident` items into `ops-tracker.md` with owner and due date.

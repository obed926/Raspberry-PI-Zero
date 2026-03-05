# Ops Tracker

## Status Legend
- `[ ]` Pending | `[~]` In Progress | `[x]` Complete | `[!]` Blocked | `[↩]` Reverted

## Active Engagements
| Engagement | Phase | Health | Last Updated |
|-----------|-------|--------|-------------|
| Scaffold Quality | Audit | On track | 2026-02-15 |

## Tasks
| Task ID | Task | Owner | Status | Outcome |
|---------|------|-------|--------|---------|
| T-002 | Full repo audit (R3) — multi-lens review | orchestrator_pm | [x] | PASS w/ fixes. 0 P0, 2 P1, 3 P2, 2 P3. Report: reports/2026-02-15_full-repo-audit-r3.md |
| T-003 | Fix P1-1: Replace rg with grep in qa-scaffold-consistency.sh | platform_pm | [x] | grep replaces rg. Consistency check now PASSES. |
| T-004 | Fix P1-2: Populate models.yaml with defaults | orchestrator_pm | [x] | Opus (primary), Sonnet (fallback), Haiku (fast). All active. |
| T-005 | Fix P2-1: Add routing targets to agents.yaml | orchestrator_pm | [x] | domain_pm, platform_pm, ops_pm added as templates. |
| T-006 | Fix P2-2: Sync mcp-registry.yaml with mcp-registry.md | domain_pm | [x] | Chrome DevTools + Playwright added to YAML registry. |
| T-007 | Fix P2-3: Deduplicate signals-intake.md | ops_pm | [x] | Root file is now a 3-line pointer to canonical. |

## Guardrail Incidents

| Incident ID | Date | Severity | Trigger | Task ID | Owner | Status | Resolution |
|-------------|------|----------|---------|---------|-------|--------|------------|
| INC-001 | 2026-02-16 | important | Edit/Write hook allowed task-state but not file scope | T-008 | ops_pm | [x] | Added scope enforcement (`check-scope.sh`) and CI regression check. |

## Agent Log Linkage

- Canonical run log: `knowledge/agent-logs/agent-runs.csv`
- Logging command: `scripts/log-agent-run.sh`

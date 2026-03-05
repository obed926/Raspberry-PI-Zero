# Project Memory

## Active Context
- Current engagement: none yet
- Project type: Raspberry Pi / IoT
- Phase: Setup
- Canonical map: docs/START-HERE.md

## Team
- PM: orchestrator-pm (hub skill)
- Worker: worker
- QA: qa
- Specialist: specialist-auditor

## Key Decisions
| # | Date | Decision | Rationale |
|---|------|----------|-----------|

## Learnings
| # | Date | Learning |
|---|------|----------|

## Memory Scope Boundary

Keep this file lean to control token burn.

- Put project state, decisions, blockers, and session learnings here.
- Move reusable procedures to `.claude/skills/*/SKILL.md`.
- Move integration/tool capabilities to `TOOLS.md` and `registry/tools.yaml`.
- If a note is generic enough to reuse across projects, it does not belong in `memory.md`.

## Memory Retention Directive (Mandatory)

Treat `memory.md` as the active slice only (target `<= 200` lines for startup load reliability).

History overflow must be moved to:
- `docs/DECISIONS.md` for decision history
- `ops-tracker.md` for execution/task timeline
- `knowledge/context-checkpoints/<task_id>.md` for handoff state before `/compact` or `/clear`
- `knowledge/lessons-learned.md` for reusable mistakes/fixes
- `.claude/skills/*/SKILL.md` for reusable procedures

Do not keep long historical logs in `memory.md`; keep only current summary + pointers.

## MCP Integrations
- Registry: registry/mcp-registry.yaml
- Human mirror: mcp-registry.md
- Last reviewed:

## Technical Debt Log

> Carried across sessions. Items stay until resolved. PM flags at session start.

| # | Item | Severity | Logged | Notes |
|---|------|----------|--------|-------|

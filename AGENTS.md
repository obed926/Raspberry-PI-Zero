# AGENTS.md

## Project Overview

Raspberry-PI-Zero — Raspberry Pi / IoT project managed by an AI agent team using the hub-and-spoke architecture.
Start mode: one orchestrator PM. Multi-team router mode is optional as the project scales.
Router mode control model: `router-pm` routes, team PMs plan, `worker-exec` performs implementation.
Router dispatch contract: `routing/pm-dispatch-contract.md` (PM briefs are objective-only; no worker-level steps).
Default toolset selection: `docs/TOOL-STACK-PROFILES.md` + `registry/tool-stack-profiles.yaml`.
Canonical project map: `docs/START-HERE.md`.
Repo analysis and logging protocol: `docs/AGENT-RUN-PROTOCOL.md`.

## Build & Test Commands

```bash
# Add your build/test commands here
```

## Code Style

- Follow existing patterns in the codebase
- Use consistent naming conventions
- Keep files focused and single-purpose

## Git Conventions

- Branch naming: `feature/`, `fix/`, `chore/`
- Commit messages: imperative mood, concise summary
- Never force-push to main
- All PRs require QA review before merge
- Strategy-critical changes also require specialist-auditor review
- External-data claims must cite MCP source + timestamp per `registry/mcp-registry.yaml` (human mirror: `mcp-registry.md`)
- Analysis/audit work must be logged to `knowledge/agent-logs/agent-runs.csv`
- Do not edit without an in-progress task row `[~]` in `ops-tracker.md` (enforced by `PreToolUse` edit hooks)
- Router-to-PM dispatches sent with `Task` must include delegation reminder and no worker command/checklist steps (enforced by `PreToolUse` Task hook)

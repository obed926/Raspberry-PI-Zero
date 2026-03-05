# Raspberry-PI-Zero

> Pointer to skills system. Claude Code auto-loads this file.

## Quick Start

1. You are the **PM** of Raspberry-PI-Zero.
2. Read `docs/START-HERE.md` for repo lane structure and operating rules.
3. Read `docs/AGENT-RUN-PROTOCOL.md` before any repo analysis or audit task.
4. Read `memory.md` for persistent context.
5. Your full operating manual is in `.claude/skills/orchestrator-pm/SKILL.md`.
6. Team PM files in `.claude/agents/` are optional scale templates. In router mode: `router-pm` routes, team PMs plan, `worker-exec` executes.
7. Quality gates are sequential: Team -> QA (`.claude/skills/qa/SKILL.md`) -> Specialist (`.claude/skills/specialist-auditor/SKILL.md`).
8. For new projects, select a default tool stack profile via `docs/TOOL-STACK-PROFILES.md` and `registry/tool-stack-profiles.yaml`.
9. In router mode, PM dispatches must follow `routing/pm-dispatch-contract.md` (objective-only, no worker steps).
10. PM dispatches sent via `Task` are hook-guarded; include delegation reminder phrase and avoid worker command checklists.
11. Use registry files as source of truth (`registry/*.yaml`) and follow `.claude/rules/hooks-mcp-governance.md` for hooks/MCP decisions.

## Rules That Never Break

1. Chain of command: CEO > PM > Team > QA > Specialist > PM > CEO
2. Never force-push to main/master.
3. Never skip quality review.
4. Never push without updating ops-tracker.md, memory.md, and `knowledge/agent-logs/agent-runs.csv`.
5. Keep `memory.md` as active context only (target `<= 200` lines); move overflow history to `docs/DECISIONS.md`, `ops-tracker.md`, and `knowledge/context-checkpoints/`.

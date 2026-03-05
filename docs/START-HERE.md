# START HERE

## Purpose

This project is organized into 4 lanes to prevent confusion as files grow:

1. `blueprint` lane: core execution files (`CLAUDE.md`, `.claude/skills/`, `.claude/agents/`, `ops-tracker.md`, `memory.md`, `TOOLS.md`)
2. `registry` lane: source-of-truth definitions for agents, tools, models, MCPs, hooks, tags
3. `knowledge` lane: research signals, source dossiers (for non-tool ecosystems), playbooks, lessons learned, and runtime agent logs
4. `archive` lane: deprecated or historical references; never used as active instructions

## Operating Rule

If there is overlap, `registry/` wins. All other files should reference registry entries by ID.

## First Session Checklist

1. Confirm `registry/agents.yaml` has only active agents.
2. Confirm `routing/pm-routing-rules.yaml` reflects current PM topology.
3. If router mode is enabled, confirm `router-pm` and team PMs are `plan` while `worker-exec` is the only execution agent.
4. Confirm `.claude/settings.json` includes `PreToolUse` hooks for `Bash`, `Edit`, `Write`, `MultiEdit`, and `Task`.
5. Confirm `.claude/scope.json` exists and reflects current allowed edit/write paths.
6. Read `docs/AGENT-RUN-PROTOCOL.md` for analysis + logging workflow.
7. Read `docs/CONTEXT-RECOVERY-PROTOCOL.md` to prevent cold-start amnesia on session restarts.
8. Read `docs/FORWARD-SCENARIO-PROTOCOL.md` for proactive pre-mortem scans.
9. Confirm router dispatches use `routing/pm-dispatch-contract.md` (objective-only PM briefs).
10. Select a default profile from `docs/TOOL-STACK-PROFILES.md` and `registry/tool-stack-profiles.yaml`.
11. Read `docs/TOKEN-COST-PROTOCOL.md` and keep cost-first defaults in `.claude/settings.json`.
12. Confirm cost controls exist: `model=sonnet`, `DISABLE_NON_ESSENTIAL_MODEL_CALLS=1`, `ENABLE_TOOL_SEARCH=auto:5`.
13. Use `scripts/opus-escalation-gate.sh` before any Opus escalation; require `OPUS_APPROVED` reason for high-score tasks.
14. Confirm `knowledge/signals/` intake has statuses for all new links.
15. Confirm `knowledge/agent-logs/agent-runs.csv` is being appended for current tasks.
16. Run `scripts/validate-agent-log.sh` before shipping audit/report updates.
17. Confirm `.github/workflows/project-quality.yml` exists for project CI checks.
18. Add or update current decisions in `docs/DECISIONS.md`.
19. Confirm `registry/command-center-map.yaml` reflects the current PM/agent topology and skill links for dashboard rendering.
20. Regenerate `docs/command-center.mmd` with `scripts/render-command-center-mermaid.sh` and verify sync via `scripts/validate-command-center-map-sync.sh`.
21. Keep OpenClaw ecosystem research in `knowledge/sources/openclaw/` (not in tool defaults) and keep a concise source dossier/index for traceability.
22. Run a forward scenario scan with `scripts/create-forward-scan-report.sh` on major architecture changes.
23. Run `scripts/validate-edit-scope-guard.sh` to verify Edit/Write scope enforcement.
24. Run `scripts/validate-doc-integrity.sh` and fail the run if local doc links are broken.
25. Run `scripts/validate-bootstrap-size.sh` to keep core startup files within token budgets.
26. Run `scripts/validate-router-compliance-replay.sh` to verify objective-only PM dispatch behavior.
27. Enforce memory retention directive: keep `memory.md` as active slice only (target `<= 200` lines); move overflow to `docs/DECISIONS.md`, `ops-tracker.md`, `knowledge/context-checkpoints/`, and `knowledge/lessons-learned.md`.
28. Run `scripts/validate-registry-governance.sh` to enforce owner/fallback/do-not-use/data-tier fields.
29. Use `knowledge/playbooks/skill-architecture-protocol.md` for context matrix, schema handoff, and learning loop format.
30. Use decision-space clamp + compaction loop from `docs/TOKEN-COST-PROTOCOL.md` before broad research or multi-agent fanout.
31. For UI/frontend tasks, apply `knowledge/playbooks/ui-vibe-design-protocol.md` before writing production UI code.
32. For branding/logo/asset workflows, apply `knowledge/playbooks/branding-asset-generation-protocol.md` and activate `branding_assets_optional` only when needed.
33. Before `/compact` or `/clear`, run `scripts/checkpoint-context.sh` then `scripts/validate-context-checkpoint.sh`.
34. For non-trivial work, enforce `docs/SPEC-FIRST-PROTOCOL.md` and validate with `scripts/validate-spec-gate.sh` before implementation.

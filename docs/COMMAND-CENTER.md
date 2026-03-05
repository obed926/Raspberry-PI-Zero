# Command Center Mapping

Use this spec whenever a project adds a dashboard, playground, or command center UI for agent orchestration.

## Goal

Make agent structure, loaded skills, and prompt sources visible without manual digging.

## Canonical Data Files

1. `registry/command-center-map.yaml` (primary render source)
2. `docs/command-center.mmd` (generated visual; never hand-edit)
3. `registry/agents.yaml` (ownership and boundaries)
4. `routing/pm-routing-rules.yaml` (routing logic)
5. `routing/orchestrator-policy.md` (single-PM vs router mode)
6. `.claude/skills/*/SKILL.md` (actual role behavior)
7. `.claude/skills/master-prompter/references/prompt-templates.md` (prompt templates)
8. `.claude/skills/master-prompter/references/prompt-quality-gate.md` (prompt quality criteria)

## Minimum UI Panels

1. Agent graph (who routes to whom)
2. Skill bindings per node (exact SKILL.md paths)
3. Prompt source panel (which templates each node may use)
4. Permissions panel (`plan` vs `acceptEdits`)
5. Cost controls panel (model, max turns, token guard settings)
6. Scope panel (`.claude/scope.json` active allow/deny paths)
7. Health panel (latest gate status from `knowledge/agent-logs/agent-runs.csv`)

## Update Rules

1. Update `registry/command-center-map.yaml` whenever agents, ownership, or skill paths change.
2. Do not hardcode layout assumptions in UI code; read lane/group info from the map.
3. Keep PM nodes in planning mode in router topology; only execution node can edit/write.
4. If a path in the map no longer exists, fail the command-center build/audit until fixed.
5. Keep model/max-turn metadata current so dashboards can flag high-cost drift quickly.

## Validation Checklist

1. Every active agent in `registry/agents.yaml` appears in `registry/command-center-map.yaml`.
2. Every `skill_path` in map resolves to an existing file.
3. Every `prompt_sources` path resolves to an existing file.
4. Graph has at least one end-to-end route: `ceo_human -> orchestrator_pm -> qa -> specialist_auditor -> orchestrator_pm`.
5. `docs/command-center.mmd` matches `registry/command-center-map.yaml` (run `scripts/validate-command-center-map-sync.sh`).

## Render and Sync Commands

Generate visual map:

```bash
./scripts/render-command-center-mermaid.sh
```

Validate sync + referenced paths:

```bash
./scripts/validate-command-center-map-sync.sh
```

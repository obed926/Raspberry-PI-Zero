# Context Recovery Protocol

Use this protocol to prevent cold-start amnesia after `/compact`, `/clear`, or session restarts.

## Core Rule

Chat is transient. File-based state is canonical.

## Mandatory Triggers

Update checkpoint before:

1. `/compact`
2. `/clear`
3. task switch
4. major decision change

## Checkpoint Schema

Each task checkpoint must include:

1. `task_id`
2. objective
3. done summary
4. key decisions
5. open risks
6. exact next step
7. files touched
8. timestamp (UTC)

## File Location

- `knowledge/context-checkpoints/<task_id>.md`

## Commands

Create/update:

```bash
./scripts/checkpoint-context.sh --task-id T-001 --next-step "Run QA checks"
```

Validate:

```bash
./scripts/validate-context-checkpoint.sh --task-id T-001
```

## Rehydrate Order

1. `docs/START-HERE.md`
2. `ops-tracker.md`
3. active `knowledge/context-checkpoints/<task_id>.md`
4. `memory.md`

## History Placement Directive (Mandatory)

`memory.md` is active context only (keep to startup-safe size, target `<= 200` lines).

Move history overflow to:
1. `docs/DECISIONS.md` (decision history)
2. `ops-tracker.md` (task/run timeline)
3. `knowledge/context-checkpoints/<task_id>.md` (handoff snapshots)
4. `knowledge/lessons-learned.md` (reusable patterns)
5. `.claude/skills/*/SKILL.md` (durable reusable procedures)

## Behavior Rule

Do not ask users for context already present in startup files unless sources conflict or fields are missing.

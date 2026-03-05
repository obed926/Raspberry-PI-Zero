# Spec-First Protocol

Use this protocol for any non-trivial task before code edits begin.

## Trigger Rule (Mandatory)

Mark task rows as `SPEC_REQUIRED` in `ops-tracker.md` when any is true:

1. task has 3+ implementation steps
2. architecture or schema changes are involved
3. external side effects are involved (deploy, data writes, external API actions)
4. failure impact is medium/high (security, finance, production reliability)

## Spec Artifact

For each `SPEC_REQUIRED` task, create:

`docs/specs/<task_id>.md`

Use `docs/specs/T-000-TEMPLATE.md` as baseline.

## Approval Marker

Before implementation, add `SPEC_APPROVED: <owner/date>` in the same `ops-tracker.md` task row.

## Mechanical Gate

Run:

```bash
./scripts/validate-spec-gate.sh
```

Validation fails when:

1. `SPEC_REQUIRED` tasks have no spec file
2. spec file is missing required sections
3. task row lacks `SPEC_APPROVED`

## Scope

Do not use spec-first for tiny edits (single-file typo, formatting-only, obvious one-line fix).

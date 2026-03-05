# Agent Logs

This folder tracks runtime behavior for active agents.

## Files

- `agent-runs.csv`: Append-only run log for every meaningful agent execution.

## Required Columns

1. `timestamp_utc`
2. `agent_id`
3. `task_id`
4. `phase` (`intake`, `execution`, `qa`, `specialist`, `delivery`, etc.)
5. `verdict` (`pass`, `fail`, `revert`, `blocked`, `info`)
6. `duration_sec`
7. `tokens_in`
8. `tokens_out`
9. `cost_usd`
10. `artifact`
11. `notes`

## Rules

1. Never rewrite previous rows; append only.
2. Use `task_id` from `ops-tracker.md` so work can be traced end-to-end.
3. Log at least one event for each gate handoff (team -> QA -> specialist -> PM).
4. Summarize weekly with `scripts/agent-log-summary.sh`.
5. Keep logs project-scoped; do not mix entries from different projects.
6. Cross-project duplicate elimination happens in curated/shared knowledge, not in raw run logs.

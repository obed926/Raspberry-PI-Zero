# Token Cost Protocol

Use this protocol to keep project automation costs stable and avoid context bloat.

## Core Rule

Cost is mostly a context problem, not a single-prompt problem.

Token burn increases when projects are over-scanned, over-delegated, or overloaded with always-on context.

## Mandatory Defaults

1. Keep baseline model at `sonnet` for PM and execution lanes.
2. Reserve `opus`/`opusplan` for complex architecture decisions only.
3. Keep `Stop` hooks command-only; do not add prompt-based Stop reviewers.
4. Keep `PreToolUse` hooks deterministic and short.
5. Keep `CLAUDE.md` slim and move specialized instructions to skills.
6. Enforce startup file-size budgets with `scripts/validate-bootstrap-size.sh`.

## Decision-Space Clamp (Mandatory)

Before broad scanning or multi-agent fanout:

1. Run a short classification pass and keep candidate paths to `<= 3`.
2. Drop any path that cannot change the final decision.
3. Define a stop condition (what evidence is enough) before deep research starts.
4. Use `haiku` for lightweight classification/routing when possible.

This keeps reasoning focused and prevents expensive "analyze everything" loops.

## Scratchpad + Compaction Discipline

1. Keep long working notes in task artifacts (`reports/`, `deliverables/`, or `ops-tracker.md` notes), not in always-on prompt context.
2. After major tool bursts, summarize into a compact state block (decision, evidence, next action, open risk).
3. If a tool output is large, extract only fields needed for the current decision.
4. Use `/compact` before context nears instability; do not wait for crashes.

## Opus Escalation Gate (Mechanical)

Never switch to Opus based on preference. Use `scripts/opus-escalation-gate.sh`.

Score model:

1. `+3` irreversible action
2. `+3` high-stakes decision (security/legal/financial/production-critical)
3. `+2` unresolved cross-team conflict
4. `+2` failed Sonnet attempts >= 2
5. `+2` unresolved critical uncertainty

Rule:

1. score `< 7` -> stay on Sonnet
2. score `>= 7` -> Opus allowed only if `ops-tracker.md` contains `OPUS_APPROVED: <reason>` for the task

Validate behavior with `scripts/validate-opus-escalation-gate.sh`.

## Session Rules

1. One objective per dispatch.
2. Use `/clear` between unrelated tasks.
3. Use `/compact` before context reaches failure territory.
4. Keep PM briefs objective-only; no worker checklists.
5. Route verbose research/log processing through subagents and return summaries.
6. Narrow `.claude/scope.json` to current task paths for large projects to prevent accidental broad edits.
7. Apply decision-space clamp before opening broad file ranges or external sources.
8. Keep scratchpad summaries short and append details to artifacts, not chat state.

## Phase Budget Thresholds (Context Window)

Use these thresholds for long tasks; trigger compaction or handoff when exceeded.

1. Intake/classification: target `<= 20%`
2. Planning/specification: target `<= 35%`
3. Implementation/editing: target `<= 55%`
4. Validation/QA: hard warning at `>= 60%` (compact immediately)
5. Never continue a non-trivial task above `70%` without checkpoint + `/compact`

## Team/Agent Rules

1. Keep teams small by default.
2. Add PMs only when split ownership is real.
3. Set `maxTurns` on PM and worker agents to prevent runaway loops.
4. Use cheaper subagent models when task complexity allows.

## MCP and Tool Rules

1. Disable unused MCP servers.
2. Lower tool-search threshold so oversized MCP definitions are deferred.
3. Use CLI tools when they provide the same signal as MCP without large tool schemas.
4. Cap MCP output token volume for routine runs.

## Local Runtime Hygiene

1. Reduce transcript retention (`cleanupPeriodDays`) from default when operating at high session volume.
2. Archive stale large logs regularly.
3. Keep debug and session artifacts from accumulating unchecked.

## Measurement

1. Use `/cost` (API users) or `/stats` (subscribers) in active sessions.
2. Log token and cost fields in `knowledge/agent-logs/agent-runs.csv`.
3. Run `scripts/agent-log-summary.sh` weekly and watch trend changes after architecture updates.

## Budget Gate (Per Task)

`scripts/validate-agent-log.sh` enforces per-task budgets by default:

1. `MAX_TASK_TOKENS_TOTAL=200000`
2. `MAX_TASK_COST_USD_TOTAL=20`

Override only with explicit project decision and logged rationale.

## Source Notes

This protocol aligns with:

1. Anthropic Claude Code cost guidance (`/cost`, model selection, compaction, subagent delegation, MCP overhead).
2. Anthropic model configuration guidance (`sonnet`, `haiku`, `opusplan`).
3. Cross-runtime context accounting patterns (context visibility, usage telemetry, and isolated subagent contexts where available).
4. Multi-agent financial-research architecture patterns that reduce token burn through constrained decision spaces and aggressive compaction.

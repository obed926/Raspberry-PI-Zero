# Hooks + MCP Governance

## Hooks Baseline (Mandatory)

1. `SessionStart`: verify `memory.md` and `ops-tracker.md` exist; remind startup sequence.
2. `PreToolUse` on `Bash`: command-only guard (no model prompt) for destructive command blocks + execution task-state checks + push protocol.
3. `PreToolUse` on `Edit`, `Write`, and `MultiEdit`: enforce `.claude/scope.json` via `.claude/hooks/check-scope.sh`, require an in-progress tracker task before changes, and protect governance files by default.
4. `PreToolUse` on `Task`: block PM dispatches that include worker-level commands/checklists and require delegation reminder phrase.
5. `Stop`: command-only dirty-worktree warning. Keep completion-quality enforcement in deterministic pretool hooks and QA gates.

Do not remove these without CEO approval.

## Enforcement Reality

Hook checks are global in Claude Code. There is no reliable per-agent identity variable for hook conditions in this scaffold.

Compensating controls in this blueprint:

1. Router/PM agents use planning-only permissions (`permissionMode: plan`, no edit tools).
2. Execution is routed to `worker-exec` for file changes.
3. Global edit hooks enforce scope, task-state, and governance-file protection.
4. Global Task hook enforces objective-only PM dispatches.
5. Governance edits require explicit override (`ALLOW_GOVERNANCE_EDIT=1`).
6. Emergency PM-dispatch override exists (`ALLOW_PM_DISPATCH_BYPASS=1`) and must be used only with CEO approval.

## Low-Token Enforcement Rule

Prefer deterministic command hooks over prompt-based Stop hooks.

1. Keep `PreToolUse` checks as the primary enforcement layer.
2. Keep `Stop` command-only to avoid token burn on every response.
3. Route behavioral quality control through task templates, QA, specialist gate, and lessons-learned updates.
4. Default runtime to `sonnet` unless escalation is required.
5. Keep `DISABLE_NON_ESSENTIAL_MODEL_CALLS=1` and `ENABLE_TOOL_SEARCH=auto:5` in project settings.

## MCP Usage Policy

Use MCP only when external data freshness materially affects the task.

Manual external work does not require MCP. Example: manually generating image/video assets in Gemini and then committing the files and metadata.

Do not use MCP when:

1. Local project files are sufficient.
2. Existing snapshots are fresh enough for the decision.
3. The call adds cost/latency but not decision quality.

Every MCP call in a deliverable must include:

1. Integration name
2. Query scope
3. Timestamp
4. Result confidence / known limitations

All active integrations must be registered in `mcp-registry.md`.

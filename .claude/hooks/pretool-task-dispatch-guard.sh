#!/usr/bin/env bash
set -euo pipefail

INPUT="${CLAUDE_TOOL_INPUT:-}"
if [ -z "$INPUT" ]; then
  exit 0
fi

if [ "${ALLOW_PM_DISPATCH_BYPASS:-0}" = "1" ]; then
  exit 0
fi

if command -v jq >/dev/null 2>&1; then
  TEXT="$(printf '%s' "$INPUT" | jq -r '.. | strings' 2>/dev/null | tr '\n' ' ')"
else
  TEXT="$INPUT"
fi

if [ -z "$TEXT" ]; then
  exit 0
fi

LOWER="$(printf '%s' "$TEXT" | tr '[:upper:]' '[:lower:]')"

# Only enforce when the Task payload appears to be dispatching to PM lanes.
if ! printf '%s' "$LOWER" | grep -Eq '(domain[-_ ]pm|platform[-_ ]pm|ops[-_ ]pm|router[-_ ]pm|@domain[-_ ]pm|@platform[-_ ]pm|@ops[-_ ]pm|@router[-_ ]pm|team pm|owning pm|owner_pm|pm agent)'; then
  exit 0
fi

if ! printf '%s' "$LOWER" | grep -Eq '(delegation protocol|deploy team roles via skill)'; then
  echo "BLOCKED: PM dispatch missing delegation reminder ('Follow your Delegation Protocol. Deploy team roles via Skill.')." >&2
  exit 2
fi

# Block worker-level command/checklist patterns in PM dispatches.
if printf '%s' "$LOWER" | grep -Eq '(rsync|scp|ssh|curl|wget|npm run|pnpm|yarn|git push|git pull|docker|kubectl|terraform|run this command|execute command|step-by-step)'; then
  echo "BLOCKED: PM dispatch includes worker-level command/checklist instructions. Use objective-only brief." >&2
  exit 2
fi

exit 0

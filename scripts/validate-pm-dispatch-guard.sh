#!/usr/bin/env bash
set -euo pipefail

HOOK=".claude/hooks/pretool-task-dispatch-guard.sh"
if [ ! -x "$HOOK" ]; then
  echo "Missing executable hook: $HOOK"
  exit 1
fi

GOOD_INPUT='{"task":"Route to domain-pm. Objective: update service page trust messaging. Follow your Delegation Protocol. Deploy team roles via Skill. Return acceptance evidence."}'
BAD_INPUT='{"task":"Send to platform-pm and run rsync to production then npm run build and curl the site."}'
BAD_INPUT_UNDERSCORE='{"task":"Route to domain_pm. Follow your Delegation Protocol. Deploy team roles via Skill. Then run rsync to production."}'

CLAUDE_TOOL_INPUT="$GOOD_INPUT" bash "$HOOK"

if CLAUDE_TOOL_INPUT="$BAD_INPUT" bash "$HOOK"; then
  echo "Dispatch guard FAILED: worker-level PM dispatch was not blocked"
  exit 1
fi

if CLAUDE_TOOL_INPUT="$BAD_INPUT_UNDERSCORE" bash "$HOOK"; then
  echo "Dispatch guard FAILED: underscore PM dispatch bypassed guard"
  exit 1
fi

echo "PM dispatch guard check PASSED."

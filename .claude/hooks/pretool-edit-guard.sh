#!/usr/bin/env bash
set -euo pipefail

INPUT="${CLAUDE_TOOL_INPUT:-}"
if [ -z "$INPUT" ]; then
  exit 0
fi

extract_path() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$INPUT" | jq -r '.file_path // .path // .target_file // .targetPath // empty' 2>/dev/null
  else
    printf '%s' "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p'
  fi
}

TARGET_PATH="$(extract_path || true)"
TARGET_PATH="${TARGET_PATH#./}"
if [ -z "$TARGET_PATH" ]; then
  exit 0
fi

if [ ! -x ".claude/hooks/check-scope.sh" ]; then
  echo "BLOCKED: missing scope guard hook (.claude/hooks/check-scope.sh)." >&2
  exit 2
fi

CLAUDE_TARGET_PATH="$TARGET_PATH" CLAUDE_TOOL_INPUT="$INPUT" bash .claude/hooks/check-scope.sh

if [ ! -f "ops-tracker.md" ]; then
  echo "BLOCKED: ops-tracker.md is required before edits." >&2
  exit 2
fi

if ! grep -qE '\|[[:space:]]*\[~\][[:space:]]*\|' "ops-tracker.md"; then
  echo "BLOCKED: No in-progress task ([~]) found in ops-tracker.md. Log work before editing." >&2
  exit 2
fi

case "$TARGET_PATH" in
  CLAUDE.md|.claude/settings.json|.claude/agents/*|.claude/rules/*|registry/*.yaml|routing/*)
    if [ "${ALLOW_GOVERNANCE_EDIT:-0}" != "1" ]; then
      echo "BLOCKED: Governance file '$TARGET_PATH' is protected. Set ALLOW_GOVERNANCE_EDIT=1 for explicit override." >&2
      exit 2
    fi
    ;;
esac

exit 0

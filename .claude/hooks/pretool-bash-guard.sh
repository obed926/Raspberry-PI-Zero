#!/usr/bin/env bash
set -euo pipefail

INPUT="${CLAUDE_TOOL_INPUT:-}"
if [ -z "$INPUT" ]; then
  exit 0
fi

extract_command() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$INPUT" | jq -r '.command // empty' 2>/dev/null
  else
    printf '%s' "$INPUT" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p'
  fi
}

CMD="$(extract_command || true)"
CMD="$(printf '%s' "$CMD" | sed 's/^[[:space:]]*//; s/[[:space:]]*$//')"
if [ -z "$CMD" ]; then
  exit 0
fi

LOWER_CMD="$(printf '%s' "$CMD" | tr '[:upper:]' '[:lower:]')"

if printf '%s' "$LOWER_CMD" | grep -qE '(^|[[:space:]])sudo([[:space:]]|$)'; then
  echo "BLOCKED: sudo is not allowed in this scaffold." >&2
  exit 2
fi

if printf '%s' "$LOWER_CMD" | grep -qE 'rm[[:space:]]+-[^[:space:]]*r[^[:space:]]*f'; then
  echo "BLOCKED: Use trash-safe workflows instead of rm -rf." >&2
  exit 2
fi

if printf '%s' "$LOWER_CMD" | grep -qE '^git[[:space:]]+push([^[:alnum:]_-]|$).*(--force|-f([[:space:]]|$))'; then
  echo "BLOCKED: force-push is not allowed." >&2
  exit 2
fi

# Any shell composition operator means the command is not read-only.
FORCE_EXECUTION_GUARD=0
if printf '%s' "$CMD" | grep -qE '(>>|>|<|\|\||\||&&|;|`|\$\()'; then
  FORCE_EXECUTION_GUARD=1
fi

is_read_only_command() {
  case "$LOWER_CMD" in
    pwd|whoami|date|uname|printenv|env|ps|top|df|du|ls*|cat*|head*|tail*|wc*|sort*|cut*|stat*|which*|rg*|grep*|find*|sed\ -n*|awk*|jq*)
      return 0
      ;;
    git\ status*|git\ log*|git\ diff*|git\ show*|git\ rev-parse*|git\ ls-remote*|git\ branch\ --show-current*)
      return 0
      ;;
    npm\ -v|npm\ --version|pnpm\ -v|pnpm\ --version|yarn\ -v|yarn\ --version|node\ -v|node\ --version|python\ --version|python3\ --version)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

if [ "$FORCE_EXECUTION_GUARD" = "1" ] || ! is_read_only_command; then
  if [ ! -f "ops-tracker.md" ]; then
    echo "BLOCKED: ops-tracker.md is required before execution commands." >&2
    exit 2
  fi
  if ! grep -qE '\|[[:space:]]*\[~\][[:space:]]*\|' "ops-tracker.md"; then
    echo "BLOCKED: No in-progress task ([~]) found in ops-tracker.md. Log work before execution commands." >&2
    exit 2
  fi
fi

if printf '%s' "$LOWER_CMD" | grep -qE '^git[[:space:]]+push'; then
  CHANGED="$(git diff --name-only HEAD 2>/dev/null || true)"
  STAGED="$(git diff --cached --name-only 2>/dev/null || true)"
  COMMITTED="$(git diff --name-only HEAD~1 HEAD 2>/dev/null || true)"
  ALL="$CHANGED $STAGED $COMMITTED"
  if ! printf '%s' "$ALL" | grep -q 'ops-tracker.md'; then
    echo "BLOCKED: ops-tracker.md not updated in this commit. Update tracking before pushing." >&2
    exit 2
  fi
  if ! printf '%s' "$ALL" | grep -q 'memory.md'; then
    echo "WARNING: memory.md not updated — confirm no decisions/learnings to log." >&2
  fi
fi

exit 0

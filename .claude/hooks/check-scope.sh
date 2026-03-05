#!/usr/bin/env bash
set -euo pipefail

INPUT="${CLAUDE_TOOL_INPUT:-}"
TARGET_PATH="${CLAUDE_TARGET_PATH:-}"
SCOPE_FILE=".claude/scope.json"

extract_path() {
  if command -v jq >/dev/null 2>&1; then
    printf '%s' "$INPUT" | jq -r '.file_path // .path // .target_file // .targetPath // empty' 2>/dev/null
  else
    printf '%s' "$INPUT" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p'
  fi
}

read_json_array() {
  local key="$1"
  awk -v key="\"$key\"" '
    $0 ~ key"[[:space:]]*:[[:space:]]*\\[" {
      in_arr=1
      sub(/^.*\[/, "")
    }
    in_arr {
      while (match($0, /"([^"]+)"/)) {
        s=substr($0, RSTART+1, RLENGTH-2)
        print s
        $0=substr($0, RSTART+RLENGTH)
      }
      if ($0 ~ /\]/) {
        in_arr=0
      }
    }
  ' "$SCOPE_FILE"
}

if [ -z "$TARGET_PATH" ]; then
  TARGET_PATH="$(extract_path || true)"
fi

TARGET_PATH="${TARGET_PATH#./}"
if [ -z "$TARGET_PATH" ]; then
  exit 0
fi

if [ ! -f "$SCOPE_FILE" ]; then
  echo "BLOCKED: missing scope policy ($SCOPE_FILE)." >&2
  exit 2
fi

enforce="$(grep -Eo '"enforce"[[:space:]]*:[[:space:]]*(true|false)' "$SCOPE_FILE" | head -n1 | sed -E 's/.*:[[:space:]]*//' || true)"
if [ "$enforce" = "false" ]; then
  exit 0
fi

if [[ "$TARGET_PATH" = /* ]] || [[ "$TARGET_PATH" = ".." ]] || [[ "$TARGET_PATH" = ../* ]] || [[ "$TARGET_PATH" = *"/../"* ]] || [[ "$TARGET_PATH" = *".." ]]; then
  echo "BLOCKED: edit target '$TARGET_PATH' is outside project scope." >&2
  exit 2
fi

while IFS= read -r deny_pattern; do
  [ -z "$deny_pattern" ] && continue
  if [[ "$TARGET_PATH" == $deny_pattern ]]; then
    echo "BLOCKED: '$TARGET_PATH' matches denied scope pattern '$deny_pattern'." >&2
    exit 2
  fi
done < <(read_json_array "deny")

allowed=0
while IFS= read -r allow_pattern; do
  [ -z "$allow_pattern" ] && continue
  has_allow=1
  if [[ "$TARGET_PATH" == $allow_pattern ]]; then
    allowed=1
    break
  fi
done < <(read_json_array "allow")

if [ "${has_allow:-0}" != "1" ]; then
  echo "BLOCKED: scope policy has no allow patterns ($SCOPE_FILE)." >&2
  exit 2
fi

if [ "$allowed" != "1" ]; then
  echo "BLOCKED: '$TARGET_PATH' is outside allowed scope. Update $SCOPE_FILE if needed." >&2
  exit 2
fi

exit 0

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAX_CLAUDE_LINES="${MAX_CLAUDE_LINES:-30}"
MAX_MEMORY_LINES="${MAX_MEMORY_LINES:-140}"
MAX_START_HERE_LINES="${MAX_START_HERE_LINES:-80}"
MAX_AGENT_RUN_PROTOCOL_LINES="${MAX_AGENT_RUN_PROTOCOL_LINES:-130}"

check_budget() {
  local rel="$1"
  local budget="$2"
  local file="$ROOT_DIR/$rel"

  if [ ! -f "$file" ]; then
    echo "[FAIL] Missing file for size budget check: $rel"
    return 1
  fi

  local lines
  lines="$(wc -l < "$file" | tr -d ' ')"
  if [ "$lines" -gt "$budget" ]; then
    echo "[FAIL] $rel exceeds line budget: $lines > $budget"
    return 1
  fi

  echo "[PASS] $rel line budget OK: $lines <= $budget"
}

failures=0
check_budget "CLAUDE.md" "$MAX_CLAUDE_LINES" || failures=$((failures + 1))
check_budget "memory.md" "$MAX_MEMORY_LINES" || failures=$((failures + 1))
check_budget "docs/START-HERE.md" "$MAX_START_HERE_LINES" || failures=$((failures + 1))
check_budget "docs/AGENT-RUN-PROTOCOL.md" "$MAX_AGENT_RUN_PROTOCOL_LINES" || failures=$((failures + 1))

if [ "$failures" -gt 0 ]; then
  echo "Bootstrap size check FAILED with $failures issue(s)."
  exit 1
fi

echo "Bootstrap size check PASSED."

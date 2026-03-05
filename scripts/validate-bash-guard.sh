#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOK="$ROOT_DIR/.claude/hooks/pretool-bash-guard.sh"

if [ ! -f "$HOOK" ]; then
  echo "[FAIL] Missing bash guard hook: $HOOK"
  exit 1
fi

run_case() {
  local cmd="$1"
  local expect="$2"
  local out rc

  set +e
  out="$(cd "$ROOT_DIR" && CLAUDE_TOOL_INPUT="{\"command\":\"$cmd\"}" bash "$HOOK" 2>&1)"
  rc=$?
  set -e

  case "$expect" in
    allow)
      if [ "$rc" -ne 0 ]; then
        echo "[FAIL] Expected allow for '$cmd' but got rc=$rc"
        echo "$out"
        exit 1
      fi
      ;;
    block)
      if [ "$rc" -ne 2 ]; then
        echo "[FAIL] Expected block for '$cmd' but got rc=$rc"
        echo "$out"
        exit 1
      fi
      ;;
    *)
      echo "[FAIL] Unknown expectation: $expect"
      exit 1
      ;;
  esac
}

run_case "git status --short" allow
run_case "git push -f origin main" block
run_case "cat > hacked.txt" block
run_case "npm test" block

echo "Bash guard check PASSED."

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
failures=0

files=(
  "CLAUDE.md"
  "AGENTS.md"
  "docs/START-HERE.md"
  "docs/AGENT-RUN-PROTOCOL.md"
  "docs/SPEC-FIRST-PROTOCOL.md"
  "docs/FORWARD-SCENARIO-PROTOCOL.md"
  "docs/COMMAND-CENTER.md"
  "docs/TOOL-STACK-PROFILES.md"
  "docs/TOKEN-COST-PROTOCOL.md"
  "routing/pm-dispatch-contract.md"
)

extract_links() {
  local file="$1"
  grep -oE '\[[^]]+\]\([^)]+\)' "$file" 2>/dev/null | sed -E 's/^[^)]*\(([^)]+)\)$/\1/' || true
}

normalize_target() {
  local target="$1"
  target="${target#<}"
  target="${target%>}"
  target="${target%% *}"
  target="${target%%#*}"
  target="${target#./}"
  if [[ "$target" == /* ]]; then
    target="${target#/}"
  fi
  printf '%s' "$target"
}

for rel in "${files[@]}"; do
  file="$ROOT_DIR/$rel"
  if [ ! -f "$file" ]; then
    echo "[FAIL] Missing documentation file: $rel"
    failures=$((failures + 1))
    continue
  fi

  while IFS= read -r raw; do
    [ -z "$raw" ] && continue
    case "$raw" in
      \#*|http://*|https://*|mailto:*|tel:*|data:*|javascript:*)
        continue
        ;;
    esac

    target="$(normalize_target "$raw")"
    [ -z "$target" ] && continue

    if [ ! -e "$ROOT_DIR/$target" ]; then
      echo "[FAIL] Broken local doc link in $rel -> $raw"
      failures=$((failures + 1))
    fi
  done < <(extract_links "$file")
done

if [ "$failures" -gt 0 ]; then
  echo "Doc integrity check FAILED with $failures issue(s)."
  exit 1
fi

echo "Doc integrity check PASSED."

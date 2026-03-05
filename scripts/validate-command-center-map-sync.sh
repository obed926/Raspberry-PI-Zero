#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAP_FILE="$ROOT_DIR/registry/command-center-map.yaml"
OUT_FILE="$ROOT_DIR/docs/command-center.mmd"
RENDER_SCRIPT="$ROOT_DIR/scripts/render-command-center-mermaid.sh"

failures=0

if [ ! -f "$MAP_FILE" ]; then
  echo "[FAIL] Missing map file: registry/command-center-map.yaml"
  exit 1
fi

if [ ! -x "$RENDER_SCRIPT" ]; then
  echo "[FAIL] Missing or non-executable render script: scripts/render-command-center-mermaid.sh"
  exit 1
fi

if [ ! -f "$OUT_FILE" ]; then
  echo "[FAIL] Missing generated diagram: docs/command-center.mmd"
  failures=$((failures + 1))
fi

while IFS= read -r rel_path; do
  [ -z "$rel_path" ] && continue
  [ "$rel_path" = "null" ] && continue
  if [ ! -f "$ROOT_DIR/$rel_path" ]; then
    echo "[FAIL] command-center map references missing file: $rel_path"
    failures=$((failures + 1))
  fi
done < <(
  {
    grep -E '^    skill_path:' "$MAP_FILE" | awk -F': ' '{print $2}'
    grep -E '^      - ' "$MAP_FILE" | awk '{print $2}'
  } | sed 's/"//g'
)

tmp_file="$(mktemp)"
trap 'rm -f "$tmp_file"' EXIT

"$RENDER_SCRIPT" --map "$MAP_FILE" --out "$tmp_file" >/dev/null

if [ -f "$OUT_FILE" ] && ! cmp -s "$tmp_file" "$OUT_FILE"; then
  echo "[FAIL] docs/command-center.mmd is out of sync with registry/command-center-map.yaml"
  echo "       Run: ./scripts/render-command-center-mermaid.sh"
  failures=$((failures + 1))
fi

if [ "$failures" -gt 0 ]; then
  echo "Command center map sync validation FAILED with $failures issue(s)."
  exit 1
fi

echo "Command center map sync validation PASSED."

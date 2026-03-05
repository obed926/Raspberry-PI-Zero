#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CHECKPOINT_DIR="$ROOT_DIR/knowledge/context-checkpoints"
task_id=""
max_age_hours="${MAX_CHECKPOINT_AGE_HOURS:-168}"

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/validate-context-checkpoint.sh --task-id <id> [--max-age-hours <n>]
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --task-id) task_id="${2:-}"; shift 2 ;;
    --max-age-hours) max_age_hours="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [ -z "$task_id" ]; then
  echo "[FAIL] Missing required --task-id" >&2
  usage
  exit 1
fi

if ! [[ "$max_age_hours" =~ ^[0-9]+$ ]]; then
  echo "[FAIL] --max-age-hours must be an integer" >&2
  exit 1
fi

file="$CHECKPOINT_DIR/${task_id}.md"
if [ ! -f "$file" ]; then
  echo "[FAIL] Missing checkpoint file: $file" >&2
  exit 1
fi

failures=0

for section in "## Objective" "## Done" "## Decisions" "## Open Risks" "## Next Step" "## Files Touched"; do
  if ! rg -q "^${section}$" "$file"; then
    echo "[FAIL] Missing section: ${section}" >&2
    failures=$((failures + 1))
  fi
done

if ! rg -q "^- timestamp_utc: " "$file"; then
  echo "[FAIL] Missing timestamp_utc metadata" >&2
  failures=$((failures + 1))
fi

if ! rg -q "^- task_id: ${task_id}$" "$file"; then
  echo "[FAIL] task_id metadata mismatch for ${task_id}" >&2
  failures=$((failures + 1))
fi

if ! awk '
  BEGIN {in_next=0; has=0}
  /^## Next Step$/ {in_next=1; next}
  /^## / && in_next {in_next=0}
  in_next && $0 !~ /^[[:space:]]*$/ {has=1}
  END {exit(has ? 0 : 1)}
' "$file"; then
  echo "[FAIL] Next Step section is empty" >&2
  failures=$((failures + 1))
fi

if [ "$failures" -gt 0 ]; then
  echo "Context checkpoint validation FAILED with $failures issue(s)." >&2
  exit 1
fi

mtime_epoch="$(stat -f %m "$file" 2>/dev/null || stat -c %Y "$file")"
now_epoch="$(date +%s)"
age_hours="$(( (now_epoch - mtime_epoch) / 3600 ))"

if [ "$age_hours" -gt "$max_age_hours" ]; then
  echo "[FAIL] Checkpoint is stale: ${age_hours}h > ${max_age_hours}h" >&2
  exit 1
fi

echo "Context checkpoint validation PASSED for ${task_id} (age=${age_hours}h)."

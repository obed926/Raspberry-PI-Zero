#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OPS_FILE="$ROOT_DIR/ops-tracker.md"
SPEC_DIR="$ROOT_DIR/docs/specs"

failures=0
required_count=0

if [ ! -f "$OPS_FILE" ]; then
  echo "[FAIL] Missing ops tracker: ops-tracker.md"
  exit 1
fi

if [ ! -d "$SPEC_DIR" ]; then
  echo "[FAIL] Missing spec directory: docs/specs"
  exit 1
fi

while IFS= read -r row; do
  [ -z "$row" ] && continue
  case "$row" in
    *"SPEC_REQUIRED"*)
      required_count=$((required_count + 1))
      task_id="$(echo "$row" | awk -F'|' '{gsub(/ /, "", $2); print $2}')"
      spec_file="$SPEC_DIR/$task_id.md"

      if [ ! -f "$spec_file" ]; then
        echo "[FAIL] $task_id marked SPEC_REQUIRED but missing $spec_file"
        failures=$((failures + 1))
        continue
      fi

      for section in \
        "## Objective" \
        "## Constraints" \
        "## Acceptance Criteria" \
        "## Test Plan" \
        "## Risks" \
        "## Rollback Plan"
      do
        if ! grep -Fq "$section" "$spec_file"; then
          echo "[FAIL] $spec_file missing section: $section"
          failures=$((failures + 1))
        fi
      done

      if ! echo "$row" | grep -Fq "SPEC_APPROVED"; then
        echo "[FAIL] $task_id SPEC_REQUIRED row missing SPEC_APPROVED marker in ops-tracker.md"
        failures=$((failures + 1))
      fi
      ;;
  esac
done < <(grep -E '^\|[[:space:]]*T-[0-9]+' "$OPS_FILE" || true)

if [ "$required_count" -eq 0 ]; then
  echo "Spec gate check PASSED (no SPEC_REQUIRED tasks found)."
  exit 0
fi

if [ "$failures" -gt 0 ]; then
  echo "Spec gate check FAILED with $failures issue(s)."
  exit 1
fi

echo "Spec gate check PASSED for $required_count SPEC_REQUIRED task(s)."

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORTS_DIR="$ROOT_DIR/reports"
DATE_UTC="$(date -u +"%Y-%m-%d")"
OUT_FILE="$REPORTS_DIR/${DATE_UTC}_forward-scenario-scan.md"
TASK_ID=""

usage() {
  cat <<USAGE
Usage:
  ./scripts/create-forward-scan-report.sh [--date YYYY-MM-DD] [--out <path>] [--task-id <id>]
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --date)
      DATE_UTC="${2:-}"
      OUT_FILE="$REPORTS_DIR/${DATE_UTC}_forward-scenario-scan.md"
      shift 2
      ;;
    --out)
      OUT_FILE="${2:-}"
      shift 2
      ;;
    --task-id)
      TASK_ID="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

mkdir -p "$(dirname "$OUT_FILE")"

if [ -f "$OUT_FILE" ]; then
  echo "Error: report already exists: $OUT_FILE" >&2
  exit 1
fi

cat > "$OUT_FILE" <<TEMPLATE
# Forward Scenario Scan

Date: ${DATE_UTC}
Run type: pre-mortem

## Lenses

1. Cost Ops
2. Runtime Reliability
3. Architecture
4. Hooks Governance
5. PM Orchestration
6. MCP Efficiency
7. Security
8. Evidence QA

## Findings (ordered by severity)

1. [P?] 

## Scenario Status Table

| ID | Status (stable/at-risk/active-incident) | Owner | Due Date | Control |
|----|------------------------------------------|-------|----------|---------|
| FS-001 |  |  |  |  |
| FS-002 |  |  |  |  |
| FS-003 |  |  |  |  |
| FS-004 |  |  |  |  |
| FS-005 |  |  |  |  |
| FS-006 |  |  |  |  |
| FS-007 |  |  |  |  |
| FS-008 |  |  |  |  |

## Validation Commands


a. \`scripts/qa-scaffold-consistency.sh\`
b. \`scripts/smoke-scaffold.sh\`
c. \`scaffold/scripts/validate-bash-guard.sh\`
d. \`scaffold/scripts/validate-pm-dispatch-guard.sh\`

## Decision

PASS / FAIL:
TEMPLATE

if [ -n "$TASK_ID" ] && [ -x "$ROOT_DIR/scripts/log-agent-run.sh" ]; then
  "$ROOT_DIR/scripts/log-agent-run.sh" \
    --agent-id orchestrator_pm \
    --task-id "$TASK_ID" \
    --phase intake \
    --verdict info \
    --artifact "$OUT_FILE" \
    --notes "Created forward scenario scan report template"
fi

echo "Created: $OUT_FILE"

#!/usr/bin/env bash
set -euo pipefail

TASK_ID=""
IRREVERSIBLE=0
HIGH_STAKES=0
CROSS_TEAM_CONFLICT=0
FAILED_SONNET_ATTEMPTS=0
CRITICAL_UNCERTAINTY=0
THRESHOLD=7
OPS_TRACKER="ops-tracker.md"

usage() {
  cat <<USAGE
Usage:
  ./scripts/opus-escalation-gate.sh \
    --task-id <T-XXX> \
    [--irreversible 0|1] \
    [--high-stakes 0|1] \
    [--cross-team-conflict 0|1] \
    [--failed-sonnet-attempts <n>] \
    [--critical-uncertainty 0|1] \
    [--threshold <n>] \
    [--ops-tracker <path>]

Scoring:
  +3 irreversible action
  +3 high-stakes decision (security/legal/financial/production-critical)
  +2 unresolved cross-team conflict
  +2 failed Sonnet attempts >= 2
  +2 unresolved critical uncertainty

Rule:
  score < threshold  => stay on Sonnet
  score >= threshold => Opus allowed only if tracker row contains OPUS_APPROVED: <reason>
USAGE
}

is_bool() {
  [ "$1" = "0" ] || [ "$1" = "1" ]
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --task-id) TASK_ID="${2:-}"; shift 2 ;;
    --irreversible) IRREVERSIBLE="${2:-}"; shift 2 ;;
    --high-stakes) HIGH_STAKES="${2:-}"; shift 2 ;;
    --cross-team-conflict) CROSS_TEAM_CONFLICT="${2:-}"; shift 2 ;;
    --failed-sonnet-attempts) FAILED_SONNET_ATTEMPTS="${2:-}"; shift 2 ;;
    --critical-uncertainty) CRITICAL_UNCERTAINTY="${2:-}"; shift 2 ;;
    --threshold) THRESHOLD="${2:-}"; shift 2 ;;
    --ops-tracker) OPS_TRACKER="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [ -z "$TASK_ID" ]; then
  echo "BLOCKED: --task-id is required." >&2
  exit 2
fi

for v in "$IRREVERSIBLE" "$HIGH_STAKES" "$CROSS_TEAM_CONFLICT" "$CRITICAL_UNCERTAINTY"; do
  if ! is_bool "$v"; then
    echo "BLOCKED: boolean flags must be 0 or 1." >&2
    exit 2
  fi
done

if ! [[ "$FAILED_SONNET_ATTEMPTS" =~ ^[0-9]+$ ]]; then
  echo "BLOCKED: --failed-sonnet-attempts must be a non-negative integer." >&2
  exit 2
fi

if ! [[ "$THRESHOLD" =~ ^[0-9]+$ ]]; then
  echo "BLOCKED: --threshold must be a non-negative integer." >&2
  exit 2
fi

score=0
[ "$IRREVERSIBLE" = "1" ] && score=$((score + 3))
[ "$HIGH_STAKES" = "1" ] && score=$((score + 3))
[ "$CROSS_TEAM_CONFLICT" = "1" ] && score=$((score + 2))
[ "$FAILED_SONNET_ATTEMPTS" -ge 2 ] && score=$((score + 2))
[ "$CRITICAL_UNCERTAINTY" = "1" ] && score=$((score + 2))

if [ "$score" -lt "$THRESHOLD" ]; then
  echo "SONNET_OK: task=$TASK_ID score=$score threshold=$THRESHOLD"
  exit 0
fi

if [ ! -f "$OPS_TRACKER" ]; then
  echo "BLOCKED: score=$score requires Opus approval, but tracker file not found: $OPS_TRACKER" >&2
  exit 2
fi

if grep -Eq "${TASK_ID}.*OPUS_APPROVED:[[:space:]]*[^|[:space:]].*" "$OPS_TRACKER"; then
  echo "OPUS_ALLOWED: task=$TASK_ID score=$score threshold=$THRESHOLD"
  exit 0
fi

echo "BLOCKED: score=$score requires OPUS_APPROVED reason in $OPS_TRACKER for task $TASK_ID" >&2
exit 2

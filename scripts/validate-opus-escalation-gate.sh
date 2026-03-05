#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GATE="$ROOT_DIR/scripts/opus-escalation-gate.sh"

if [ ! -x "$GATE" ]; then
  echo "[FAIL] Missing or non-executable Opus escalation gate: $GATE"
  exit 1
fi

TMP_TRACKER="$(mktemp)"
trap 'rm -f "$TMP_TRACKER"' EXIT

cat > "$TMP_TRACKER" <<'TRACKER'
# Ops Tracker
| Task ID | Task | Owner | Status | Outcome |
|---------|------|-------|--------|---------|
| T-LOW | low risk task | pm | [~] | in progress |
| T-HIGH | high risk task | pm | [~] | OPUS_APPROVED: Security + prod risk + unresolved cross-team conflict |
TRACKER

# Low score should allow Sonnet path with no Opus approval requirement.
"$GATE" --task-id T-LOW --high-stakes 0 --irreversible 0 --cross-team-conflict 0 --failed-sonnet-attempts 0 --critical-uncertainty 0 --ops-tracker "$TMP_TRACKER" >/dev/null

# High score should block when no approval is present.
set +e
"$GATE" --task-id T-MISS --high-stakes 1 --irreversible 1 --cross-team-conflict 1 --failed-sonnet-attempts 2 --critical-uncertainty 1 --ops-tracker "$TMP_TRACKER" >/dev/null 2>&1
rc=$?
set -e
if [ "$rc" -ne 2 ]; then
  echo "[FAIL] Expected high-score task without approval to block (rc=2), got rc=$rc"
  exit 1
fi

# High score should pass when approval is present.
"$GATE" --task-id T-HIGH --high-stakes 1 --irreversible 1 --cross-team-conflict 1 --failed-sonnet-attempts 2 --critical-uncertainty 1 --ops-tracker "$TMP_TRACKER" >/dev/null

echo "Opus escalation gate check PASSED."

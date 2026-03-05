#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$ROOT_DIR/knowledge/agent-logs/agent-runs.csv"
EXPECTED_HEADER="timestamp_utc,agent_id,task_id,phase,verdict,duration_sec,tokens_in,tokens_out,cost_usd,artifact,notes"
MAX_TASK_TOKENS_TOTAL="${MAX_TASK_TOKENS_TOTAL:-200000}"
MAX_TASK_COST_USD_TOTAL="${MAX_TASK_COST_USD_TOTAL:-20}"

if [ ! -f "$LOG_FILE" ]; then
  echo "[FAIL] Missing log file: $LOG_FILE"
  exit 1
fi

header="$(head -n 1 "$LOG_FILE")"
if [ "$header" != "$EXPECTED_HEADER" ]; then
  echo "[FAIL] Agent log header mismatch"
  echo "Expected: $EXPECTED_HEADER"
  echo "Actual:   $header"
  exit 1
fi

awk -F',' -v max_task_tokens="$MAX_TASK_TOKENS_TOTAL" -v max_task_cost="$MAX_TASK_COST_USD_TOTAL" '
NR==1 { next }
{
  if (NF != 11) {
    printf("[FAIL] Line %d has %d fields (expected 11)\n", NR, NF)
    fail=1
  }

  if ($1 == "" || $2 == "" || $3 == "" || $4 == "" || $5 == "") {
    printf("[FAIL] Line %d missing required field(s) timestamp_utc/agent_id/task_id/phase/verdict\n", NR)
    fail=1
  }

  if ($5 !~ /^(pass|fail|revert|blocked|info)$/) {
    printf("[FAIL] Line %d invalid verdict: %s\n", NR, $5)
    fail=1
  }

  if ($6 != "" && $6 !~ /^[0-9]+$/) {
    printf("[FAIL] Line %d duration_sec must be integer when set\n", NR)
    fail=1
  }

  if ($7 != "" && $7 !~ /^[0-9]+$/) {
    printf("[FAIL] Line %d tokens_in must be integer when set\n", NR)
    fail=1
  }

  if ($8 != "" && $8 !~ /^[0-9]+$/) {
    printf("[FAIL] Line %d tokens_out must be integer when set\n", NR)
    fail=1
  }

  if ($9 != "" && $9 !~ /^[0-9]+(\.[0-9]+)?$/) {
    printf("[FAIL] Line %d cost_usd must be numeric when set\n", NR)
    fail=1
  }

  tokens_in = ($7 == "" ? 0 : $7 + 0)
  tokens_out = ($8 == "" ? 0 : $8 + 0)
  cost = ($9 == "" ? 0 : $9 + 0)
  task_tokens[$3] += tokens_in + tokens_out
  task_cost[$3] += cost
}
END {
  for (task_id in task_tokens) {
    if (task_tokens[task_id] > max_task_tokens) {
      printf("[FAIL] Task %s token budget exceeded: %d > %d\n", task_id, task_tokens[task_id], max_task_tokens)
      fail=1
    }
  }
  for (task_id in task_cost) {
    if (task_cost[task_id] > max_task_cost) {
      printf("[FAIL] Task %s cost budget exceeded: %.4f > %.4f\n", task_id, task_cost[task_id], max_task_cost)
      fail=1
    }
  }

  if (fail) {
    exit 1
  }
  printf("Agent log schema + budget check PASSED (max_task_tokens=%d, max_task_cost=%.4f).\n", max_task_tokens, max_task_cost)
}
' "$LOG_FILE"

#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$ROOT_DIR/knowledge/agent-logs/agent-runs.csv"

if [ ! -f "$LOG_FILE" ]; then
  echo "No log file found at: $LOG_FILE"
  exit 0
fi

if [ "$(wc -l < "$LOG_FILE")" -le 1 ]; then
  echo "No agent run entries yet."
  exit 0
fi

echo "Agent Run Summary"
echo "================="
awk -F',' '
NR==1 {next}
{
  a=$2
  v=$5
  ti=($7=="" ? 0 : $7+0)
  to=($8=="" ? 0 : $8+0)
  cu=($9=="" ? 0 : $9+0)
  total[a]++
  verdict[a,v]++
  tokens_in[a]+=ti
  tokens_out[a]+=to
  cost[a]+=cu
  grand_total++
  grand_tokens_in+=ti
  grand_tokens_out+=to
  grand_cost+=cu
}
END {
  printf "%-24s %8s %8s %8s %8s %8s %12s %12s %12s\n", "agent_id", "total", "pass", "fail", "revert", "blocked", "tokens_in", "tokens_out", "cost_usd"
  for (a in total) {
    printf "%-24s %8d %8d %8d %8d %8d %12d %12d %12.4f\n", a, total[a], verdict[a,"pass"], verdict[a,"fail"], verdict[a,"revert"], verdict[a,"blocked"], tokens_in[a], tokens_out[a], cost[a]
  }
  printf "\n%-24s %8d %8s %8s %8s %8s %12d %12d %12.4f\n", "TOTAL", grand_total, "-", "-", "-", "-", grand_tokens_in, grand_tokens_out, grand_cost
}
' "$LOG_FILE"

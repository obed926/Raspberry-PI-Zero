#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="$ROOT_DIR/knowledge/agent-logs/agent-runs.csv"

usage() {
  cat <<USAGE
Usage:
  ./scripts/log-agent-run.sh \
    --agent-id <id> \
    --task-id <task> \
    --phase <phase> \
    --verdict <pass|fail|revert|blocked|info> \
    [--duration-sec <n>] \
    [--tokens-in <n>] \
    [--tokens-out <n>] \
    [--cost-usd <amount>] \
    [--artifact <path>] \
    [--notes <text>] \
    [--timestamp-utc <YYYY-MM-DDTHH:MM:SSZ>]
USAGE
}

sanitize_csv() {
  printf '%s' "$1" | tr '\n\r' '  ' | sed 's/,/;/g'
}

agent_id=""
task_id=""
phase=""
verdict=""
duration_sec=""
tokens_in=""
tokens_out=""
cost_usd=""
artifact=""
notes=""
timestamp_utc="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --agent-id) agent_id="${2:-}"; shift 2 ;;
    --task-id) task_id="${2:-}"; shift 2 ;;
    --phase) phase="${2:-}"; shift 2 ;;
    --verdict) verdict="${2:-}"; shift 2 ;;
    --duration-sec) duration_sec="${2:-}"; shift 2 ;;
    --tokens-in) tokens_in="${2:-}"; shift 2 ;;
    --tokens-out) tokens_out="${2:-}"; shift 2 ;;
    --cost-usd) cost_usd="${2:-}"; shift 2 ;;
    --artifact) artifact="${2:-}"; shift 2 ;;
    --notes) notes="${2:-}"; shift 2 ;;
    --timestamp-utc) timestamp_utc="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1"; usage; exit 1 ;;
  esac
done

if [ -z "$agent_id" ] || [ -z "$task_id" ] || [ -z "$phase" ] || [ -z "$verdict" ]; then
  echo "Error: --agent-id, --task-id, --phase, and --verdict are required."
  usage
  exit 1
fi

mkdir -p "$(dirname "$LOG_FILE")"
if [ ! -f "$LOG_FILE" ]; then
  echo "timestamp_utc,agent_id,task_id,phase,verdict,duration_sec,tokens_in,tokens_out,cost_usd,artifact,notes" > "$LOG_FILE"
fi

row="$(sanitize_csv "$timestamp_utc"),$(sanitize_csv "$agent_id"),$(sanitize_csv "$task_id"),$(sanitize_csv "$phase"),$(sanitize_csv "$verdict"),$(sanitize_csv "$duration_sec"),$(sanitize_csv "$tokens_in"),$(sanitize_csv "$tokens_out"),$(sanitize_csv "$cost_usd"),$(sanitize_csv "$artifact"),$(sanitize_csv "$notes")"

echo "$row" >> "$LOG_FILE"
echo "Logged agent run: $agent_id $task_id $phase $verdict"

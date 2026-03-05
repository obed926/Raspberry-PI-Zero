#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT_DIR/knowledge/context-checkpoints"

task_id=""
objective=""
done_summary=""
decisions=""
open_risks=""
next_step=""
files_touched=""
owner="${CHECKPOINT_OWNER:-orchestrator_pm}"

usage() {
  cat <<'USAGE'
Usage:
  ./scripts/checkpoint-context.sh --task-id <id> [options]

Options:
  --task-id <id>      Required task id
  --objective <text>  Objective summary
  --done <text>       Done summary
  --decisions <text>  Key decisions
  --open-risks <text> Open risks/blockers
  --next-step <text>  Exact next step
  --files <csv>       Files touched (comma-separated)
  --owner <id>        Owner id (default: orchestrator_pm)
USAGE
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --task-id) task_id="${2:-}"; shift 2 ;;
    --objective) objective="${2:-}"; shift 2 ;;
    --done) done_summary="${2:-}"; shift 2 ;;
    --decisions) decisions="${2:-}"; shift 2 ;;
    --open-risks) open_risks="${2:-}"; shift 2 ;;
    --next-step) next_step="${2:-}"; shift 2 ;;
    --files) files_touched="${2:-}"; shift 2 ;;
    --owner) owner="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage; exit 1 ;;
  esac
done

if [ -z "$task_id" ]; then
  echo "Missing required --task-id" >&2
  usage
  exit 1
fi

mkdir -p "$OUT_DIR"
out_file="$OUT_DIR/${task_id}.md"
timestamp="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

cat > "$out_file" <<EOF
# Context Checkpoint: ${task_id}

- timestamp_utc: ${timestamp}
- owner: ${owner}
- task_id: ${task_id}

## Objective
${objective}

## Done
${done_summary}

## Decisions
${decisions}

## Open Risks
${open_risks}

## Next Step
${next_step}

## Files Touched
${files_touched}
EOF

echo "Checkpoint written: ${out_file}"

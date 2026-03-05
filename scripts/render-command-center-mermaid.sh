#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAP_FILE="$ROOT_DIR/registry/command-center-map.yaml"
OUT_FILE="$ROOT_DIR/docs/command-center.mmd"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/render-command-center-mermaid.sh [--map <path>] [--out <path>]

Options:
  --map <path>  Path to command-center-map.yaml
  --out <path>  Output Mermaid file path
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --map)
      MAP_FILE="${2:-}"
      shift 2
      ;;
    --out)
      OUT_FILE="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [ ! -f "$MAP_FILE" ]; then
  echo "Map file not found: $MAP_FILE" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT_FILE")"

awk '
function clean(val) {
  gsub(/^[[:space:]]+|[[:space:]]+$/, "", val)
  gsub(/^"/, "", val)
  gsub(/"$/, "", val)
  return val
}
BEGIN {
  section = ""
  current_lane = ""
  current_node = ""
  edge_from = ""
  edge_to = ""
}
/^layout:/ { section = "layout"; next }
/^nodes:/ { section = "nodes"; current_node = ""; next }
/^edges:/ { section = "edges"; edge_from = ""; edge_to = ""; next }
/^validation:/ { section = "validation"; next }
{
  if (section == "layout") {
    if ($0 ~ /^  lanes:/) {
      in_lanes = 1
      next
    }
    if (in_lanes && $0 ~ /^    - lane_id:/) {
      current_lane = clean(substr($0, index($0, ":") + 1))
      if (!(current_lane in lane_seen)) {
        lane_order[++lane_count] = current_lane
        lane_seen[current_lane] = 1
      }
      next
    }
    if (in_lanes && $0 ~ /^      label:/) {
      lane_label[current_lane] = clean(substr($0, index($0, ":") + 1))
      next
    }
    if ($0 !~ /^    / && $0 !~ /^      /) {
      in_lanes = 0
    }
  }

  if (section == "nodes") {
    if ($0 ~ /^  - node_id:/) {
      current_node = clean(substr($0, index($0, ":") + 1))
      if (!(current_node in node_seen)) {
        node_order[++node_count] = current_node
        node_seen[current_node] = 1
      }
      next
    }
    if (current_node != "" && $0 ~ /^    label:/) {
      node_label[current_node] = clean(substr($0, index($0, ":") + 1))
      next
    }
    if (current_node != "" && $0 ~ /^    lane_id:/) {
      node_lane[current_node] = clean(substr($0, index($0, ":") + 1))
      next
    }
  }

  if (section == "edges") {
    if ($0 ~ /^  - from:/) {
      edge_from = clean(substr($0, index($0, ":") + 1))
      next
    }
    if ($0 ~ /^    to:/) {
      edge_to = clean(substr($0, index($0, ":") + 1))
      next
    }
    if ($0 ~ /^    relation:/) {
      edge_relation = clean(substr($0, index($0, ":") + 1))
      edge_rel[++edge_count] = edge_relation
      edge_src[edge_count] = edge_from
      edge_dst[edge_count] = edge_to
      edge_from = ""
      edge_to = ""
      next
    }
  }
}
END {
  print "%% Auto-generated from registry/command-center-map.yaml"
  print "flowchart TD"
  print ""
  for (i = 1; i <= lane_count; i++) {
    lane = lane_order[i]
    label = lane_label[lane]
    if (label == "") {
      label = lane
    }
    print "  subgraph " lane "[\"" label "\"]"
    for (j = 1; j <= node_count; j++) {
      node = node_order[j]
      if (node_lane[node] == lane) {
        lbl = node_label[node]
        if (lbl == "") {
          lbl = node
        }
        print "    " node "[\"" lbl "\"]"
      }
    }
    print "  end"
    print ""
  }

  for (k = 1; k <= edge_count; k++) {
    rel = edge_rel[k]
    gsub(/_/, " ", rel)
    if (rel == "") {
      print "  " edge_src[k] " --> " edge_dst[k]
    } else {
      print "  " edge_src[k] " -->|\"" rel "\"| " edge_dst[k]
    }
  }
}
' "$MAP_FILE" > "$OUT_FILE"

echo "Rendered Mermaid diagram: $OUT_FILE"

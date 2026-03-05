#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOOLS_FILE="$ROOT_DIR/registry/tools.yaml"
MCP_FILE="$ROOT_DIR/registry/mcp-registry.yaml"

failures=0

validate_registry_file() {
  local file="$1"
  local id_key="$2"
  local label="$3"

  if [ ! -f "$file" ]; then
    echo "[FAIL] Missing $label registry file: $file"
    failures=$((failures + 1))
    return
  fi

  local ids
  ids="$(grep -c "^  - $id_key:" "$file" || true)"
  local owners
  owners="$(grep -c "^    owner:" "$file" || true)"
  local do_not_use
  do_not_use="$(grep -c "^    do_not_use_for:" "$file" || true)"
  local fallbacks
  fallbacks="$(grep -c "^    fallback_source:" "$file" || true)"
  local tiers
  tiers="$(grep -c "^    data_sensitivity_tiers:" "$file" || true)"

  if [ "$ids" -eq 0 ]; then
    echo "[FAIL] $label registry has no entries"
    failures=$((failures + 1))
    return
  fi

  if [ "$owners" -ne "$ids" ]; then
    echo "[FAIL] $label registry owner count mismatch ($owners != $ids)"
    failures=$((failures + 1))
  fi
  if [ "$do_not_use" -ne "$ids" ]; then
    echo "[FAIL] $label registry do_not_use_for count mismatch ($do_not_use != $ids)"
    failures=$((failures + 1))
  fi
  if [ "$fallbacks" -ne "$ids" ]; then
    echo "[FAIL] $label registry fallback_source count mismatch ($fallbacks != $ids)"
    failures=$((failures + 1))
  fi
  if [ "$tiers" -ne "$ids" ]; then
    echo "[FAIL] $label registry data_sensitivity_tiers count mismatch ($tiers != $ids)"
    failures=$((failures + 1))
  fi
}

validate_registry_file "$TOOLS_FILE" "tool_id" "tools"
validate_registry_file "$MCP_FILE" "integration_id" "mcp"

if [ "$failures" -gt 0 ]; then
  echo "Registry governance validation FAILED with $failures issue(s)."
  exit 1
fi

echo "Registry governance validation PASSED."

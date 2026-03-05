#!/usr/bin/env bash
set -euo pipefail

HOOK=".claude/hooks/pretool-task-dispatch-guard.sh"
if [ ! -x "$HOOK" ]; then
  echo "[FAIL] Missing executable hook: $HOOK"
  exit 1
fi

expect_pass() {
  local label="$1"
  local payload="$2"
  if ! CLAUDE_TOOL_INPUT="$payload" bash "$HOOK" >/dev/null 2>&1; then
    echo "[FAIL] Expected pass for case: $label"
    exit 1
  fi
}

expect_block() {
  local label="$1"
  local payload="$2"
  if CLAUDE_TOOL_INPUT="$payload" bash "$HOOK" >/dev/null 2>&1; then
    echo "[FAIL] Expected block for case: $label"
    exit 1
  fi
}

# Good objective-only PM dispatches.
expect_pass "objective-only domain dispatch" \
  '{"task":"Route to domain-pm. Objective: refresh local service trust messaging. Follow your Delegation Protocol. Deploy team roles via Skill. Return acceptance evidence."}'
expect_pass "objective-only platform dispatch" \
  '{"task":"Send to platform-pm. Objective: stabilize build reliability and report constraints. Follow your Delegation Protocol. Deploy team roles via Skill."}'

# Blocked patterns.
expect_block "missing delegation reminder" \
  '{"task":"Route to ops-pm. Objective: verify release readiness and report blockers."}'
expect_block "worker command checklist" \
  '{"task":"Route to platform-pm. Follow your Delegation Protocol. Deploy team roles via Skill. Then run npm run build, rsync to prod, and curl health endpoint."}'
expect_block "step-by-step worker wording" \
  '{"task":"Dispatch to domain_pm. Follow your Delegation Protocol. Deploy team roles via Skill. Step-by-step: edit files, execute command list, and push."}'

echo "Router dispatch compliance replay PASSED."

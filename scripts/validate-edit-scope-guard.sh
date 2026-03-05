#!/usr/bin/env bash
set -euo pipefail

HOOK=".claude/hooks/pretool-edit-guard.sh"
SCOPE_HOOK=".claude/hooks/check-scope.sh"
SCOPE_FILE=".claude/scope.json"

if [ ! -x "$HOOK" ]; then
  echo "[FAIL] Missing executable edit guard: $HOOK"
  exit 1
fi

if [ ! -x "$SCOPE_HOOK" ]; then
  echo "[FAIL] Missing executable scope guard: $SCOPE_HOOK"
  exit 1
fi

if [ ! -f "$SCOPE_FILE" ]; then
  echo "[FAIL] Missing scope policy file: $SCOPE_FILE"
  exit 1
fi

if ! grep -q "check-scope.sh" "$HOOK"; then
  echo "[FAIL] Edit guard does not call check-scope.sh"
  exit 1
fi

# Allowed path should pass.
CLAUDE_TARGET_PATH="docs/START-HERE.md" bash "$SCOPE_HOOK" >/dev/null

# Path traversal should be blocked.
set +e
CLAUDE_TARGET_PATH="../outside.md" bash "$SCOPE_HOOK" >/dev/null 2>&1
rc=$?
set -e
if [ "$rc" -ne 2 ]; then
  echo "[FAIL] Expected traversal target to block with rc=2, got rc=$rc"
  exit 1
fi

# .git writes should be blocked by deny list.
set +e
CLAUDE_TARGET_PATH=".git/config" bash "$SCOPE_HOOK" >/dev/null 2>&1
rc=$?
set -e
if [ "$rc" -ne 2 ]; then
  echo "[FAIL] Expected .git target to block with rc=2, got rc=$rc"
  exit 1
fi

# Unknown top-level path should block by allowlist.
set +e
CLAUDE_TARGET_PATH="private-secrets.txt" bash "$SCOPE_HOOK" >/dev/null 2>&1
rc=$?
set -e
if [ "$rc" -ne 2 ]; then
  echo "[FAIL] Expected out-of-allowlist path to block with rc=2, got rc=$rc"
  exit 1
fi

echo "Edit/Write scope guard check PASSED."

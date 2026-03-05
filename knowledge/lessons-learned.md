# Lessons Learned

| ID | Date | Context | Outcome Class | Lesson | Rule Added | Owner |
|----|------|---------|---------------|--------|------------|-------|
| LL-001 | 2026-02-16 | Edit/Write hooks accepted task-state but did not enforce scoped file boundaries | rewrote_significantly | Hook policy without path scope still allows accidental cross-boundary edits | Added `.claude/hooks/check-scope.sh` + `.claude/scope.json` and mandatory `validate-edit-scope-guard.sh` in CI/smoke | ops_pm |

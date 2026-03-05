# Git Safety Rules

1. **Never force-push.** Not to main, not to any shared branch. If you need to rewrite history, get CEO approval first.
2. **Never rebase main** without explicit CEO approval.
3. **Never run destructive git commands** (`reset --hard`, `clean -f`, `branch -D`) without CEO approval.
4. **Always update tracking files** (ops-tracker.md, memory.md) before pushing.
5. **Commit after each logical unit of work** — don't accumulate large uncommitted changes.

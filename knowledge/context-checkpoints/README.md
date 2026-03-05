# Context Checkpoints

Store one checkpoint per active task:

- `knowledge/context-checkpoints/T-001.md`
- `knowledge/context-checkpoints/T-002.md`

Use:

```bash
./scripts/checkpoint-context.sh --task-id T-001 --next-step "Run QA"
./scripts/validate-context-checkpoint.sh --task-id T-001
```

Rule: update checkpoint before `/compact` or `/clear`.

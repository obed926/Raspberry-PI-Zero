# Prompt Quality Gate

Reject prompt if any condition fails:

1. Missing objective, scope, or deliverable.
2. Missing measurable acceptance criteria.
3. Missing anti-pattern section.
4. Missing escalation or stop condition.
5. Missing report schema requirement.
6. Uses vague verbs without quantification.
7. If target is PM, prompt includes worker-level commands or step-by-step execution instructions.
8. If target is PM, prompt omits delegation reminder ("Follow Delegation Protocol", "Deploy via Skill").

## Vague Verb Ban List

- improve
- optimize
- clean up
- polish
- make better
- refactor

Dispatch only after all checks pass.

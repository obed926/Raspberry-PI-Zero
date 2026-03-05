# Prompt Templates

## PM Gateway Template

- User query
- PM brief (objective, scope, constraints, non-goals)
- Risk level (low/medium/high)
- Selected reviewers and rationale
- Dispatch order
- Acceptance criteria

## PM Dispatch Template (Objective-Only)

- Target PM (domain/platform/ops)
- Objective (single verifiable outcome)
- Scope: in / out
- Constraints and risks
- Acceptance criteria
- Delegation reminder (required):
  - "Follow your Delegation Protocol."
  - "Deploy team roles via Skill."
  - "Review outputs before reporting."

Forbidden in this template:
- shell commands
- build/deploy checklists
- file-edit step lists
- mixed signals (delegate + do it yourself)

## Reviewer Prompt Template

- Identity (why this reviewer exists)
- Objective
- Context
- Scope in/out
- Required evidence standard
- Acceptance criteria
- Anti-patterns
- Output schema requirement

## Merge Template

- Consolidated findings by severity
- Conflicts between reviewers
- PM ruling for each conflict
- Ordered action plan (fixes first, enhancements second)

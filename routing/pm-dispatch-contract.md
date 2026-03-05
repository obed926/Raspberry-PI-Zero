# PM Dispatch Contract

Use this contract whenever Router (or orchestrator acting as router) dispatches to a PM.

## Objective

PM receives a management brief, not a worker checklist.

## Required Format

Every PM dispatch must include:

1. Objective (single outcome)
2. Scope (in / out)
3. Constraints and risks
4. Acceptance criteria
5. Explicit delegation reminder:
   - "Follow your Delegation Protocol."
   - "Deploy team roles via Skill."
   - "Review role outputs before reporting."

## Forbidden in PM Dispatch

Do not include worker-level instructions, such as:

1. Shell commands (`rsync`, `npm run build`, `curl`, etc.)
2. Step-by-step implementation sequences
3. File-edit directives intended for execution workers
4. Mixed signals like "delegate roles" plus "start writing/building now"

## Example (Correct)

`Objective: Deploy footer credit update to production. Follow your Delegation Protocol and assign execution to the appropriate role via Skill. Validate output against acceptance criteria and report status with evidence.`

## Example (Incorrect)

`Build site, run rsync to production, then curl for 200 and report back.`

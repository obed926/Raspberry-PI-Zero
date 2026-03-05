# Qwen 3.5 Evaluation Matrix Template

Use this before promoting Qwen 3.5 from reference to active runtime in any project.

## Metadata

- Date:
- Evaluator:
- Project:
- Candidate model(s):
- Baseline model(s):

## Test Categories

1. Task success rate (functional correctness)
2. Tool-calling reliability (valid calls, argument quality)
3. Long-context stability (no degradation or loop behavior)
4. Cost per successful task
5. Latency per successful task
6. Safety/guardrail compliance rate

## Scoring Table

| Category | Baseline Score | Qwen Score | Pass/Fail | Notes |
|----------|----------------|------------|-----------|-------|
| Functional correctness |  |  |  |  |
| Tool-calling quality |  |  |  |  |
| Long-context behavior |  |  |  |  |
| Cost efficiency |  |  |  |  |
| Latency |  |  |  |  |
| Safety/Compliance |  |  |  |  |

## Promotion Gate

Promote only if all are true:

1. no P0/P1 regressions versus baseline
2. safety/guardrail compliance is equal or better
3. net cost or latency is justified by measurable quality gains
4. operational complexity is acceptable for the team

## Final Decision

- Decision: `promote` / `keep-reference-only`
- Rationale:
- Required follow-up actions:

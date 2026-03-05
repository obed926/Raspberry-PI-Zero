---
name: master-prompter
description: >
  PM orchestration gateway for Raspberry-PI-Zero. Converts CEO requests into
  launch-ready prompts, selects reviewer lenses, and enforces report schema.
  Use for cross-agent planning, whole-repo audits, prompt upgrades, and
  quality-gated dispatch.
  Triggers: "run audit", "master prompt", "what are we missing",
  "improve prompt quality", "dispatch reviewers", "review whole repo"
---

# Master Prompter

> Prompt quality is operational quality.

## Orchestration Contract

1. Convert CEO request into a PM brief with objective, scope, risks, and success criteria.
2. Select the minimum reviewer set that covers the risk.
3. Generate one launch prompt per reviewer with pass/fail acceptance checks.
4. Enforce chain of command in every prompt: CEO -> PM -> Team -> QA -> Specialist -> PM -> CEO.
5. Require schema-compliant reviewer outputs for every dispatch.
6. For PM dispatch prompts, enforce objective-based briefs only. Never include worker-level commands or step-by-step execution instructions.

## Full-Repo Audit Launch Protocol

Use this default sequence when the ask is "audit everything", "fresh eyes", or "what are we missing?":

1. Breaker lens: abuse paths, adversarial edge cases, failure triggers.
2. Security lens: trust boundaries, secrets, auth, dependency risk.
3. Architecture lens: boundaries, coupling, scaling logic, role clarity.
4. Performance/reliability lens: latency, failure recovery, operational resilience.
5. Merge findings into one PM action plan ordered by severity.
6. Require run-log entries in `knowledge/agent-logs/agent-runs.csv` for each gate handoff.

If a lens is irrelevant, state why and skip it explicitly.

## Fire Prompt Laws (Mandatory)

1. Identity over role.
2. Stakes over task list.
3. Challenge obvious first answers.
4. Use measurable constraints.
5. Define anti-patterns as auto-fail.
6. Output must be directly usable by next gate.
7. Require uncomfortable-truth callout.

## Prompt Quality Gate (Fail Closed)

Regenerate any prompt that misses one or more:

1. Concrete objective (single outcome).
2. Explicit in-scope and out-of-scope.
3. Measurable constraints.
4. Pass/fail acceptance criteria.
5. Validation commands or validation method.
6. Anti-patterns section.
7. Escalation/stop condition.
8. Required report schema.
9. If target is a PM, brief contains outcome + delegation reminder and excludes worker-level instructions.

## Required Reviewer Output Schema

All reviewers must return:

1. `verdict`: pass/fail
2. `critical_findings`: severity + confidence + evidence
3. `missing_items`: what the team did not assess
4. `enhancements`: concrete upgrades that improve system quality
5. `residual_risks`: risk that remains after fixes
6. `recommended_actions`: ordered by execution priority

Reference: `.claude/skills/master-prompter/references/review-report-schema.md`

## Prompt Assembly Checklist

Before dispatch:

1. Context loaded from `memory.md` and `ops-tracker.md`
2. Objective is singular and testable
3. Reviewer lens and evidence expectations are explicit
4. Output format is schema-compliant
5. Handoff target is explicit (QA, Specialist, or PM)

## Asset Prompting Mode (Visuals)

When the task is image/video asset generation:

1. Load `.claude/skills/master-prompter/references/asset-generation-sop.md`.
2. Enforce minimal-text policy (image: 1-3 words, video: 0 words).
3. Require physical text container + negative-space planning.
4. If long copy is requested, generate blank container and flag for post-production overlay.
5. Return asset metadata (model, prompt, timestamp, text mode, overlay zone).

## Anti-Patterns

- Never dispatch vague prompts ("improve", "optimize", "clean up") without measurable target
- Never skip uncomfortable-truth mandate
- Never accept reviewer output without evidence and severity
- Never return findings without a priority-ordered action list

## References

- `.claude/skills/master-prompter/references/prompt-templates.md`
- `.claude/skills/master-prompter/references/prompt-quality-gate.md`
- `.claude/skills/master-prompter/references/review-routing-matrix.md`
- `.claude/skills/master-prompter/references/review-report-schema.md`
- `.claude/skills/master-prompter/references/asset-generation-sop.md`
- `routing/pm-dispatch-contract.md`

---
name: executive-ops
description: >
  Optional executive-ops workflow layer for briefing, triage, relationship
  health, and goal-aligned action routing. Use only when the project selects
  the `executive_ops_optional` stack profile.
---

# Executive Ops (Optional)

Use this skill only when `docs/DECISIONS.md` explicitly selects
`executive_ops_optional`.

## Mission

Provide a chief-of-staff style operating layer that helps:
1. Run daily/weekly briefings.
2. Triage communications with clear urgency tiers.
3. Track relationship health and follow-up state.
4. Keep work aligned to declared priorities.

## Hard Guardrails

1. Never send outbound messages without explicit approval.
2. Never execute destructive actions without explicit approval.
3. Never hide channel coverage gaps; report skipped/unavailable channels.
4. Never create external tasks automatically unless approval queue rules permit it.
5. Always include source attribution for summaries and recommendations.

## Operating Patterns

1. Briefings:
   - Verify current time/date from an authoritative tool.
   - Summarize calendar, urgent items, and top priorities.
   - Flag misalignment between schedule and goals.

2. Triage:
   - Classify by urgency (`tier_1`, `tier_2`, `tier_3`).
   - Detect already-handled threads before drafting.
   - Provide send-ready drafts for actionable items.

3. Relationship hygiene:
   - Track interaction recency.
   - Separate `my_actions` from `waiting_on_others`.
   - Suggest follow-up drafts, but require approval before send.

4. Queue-state clarity:
   - Every tracked item has owner, due date, and state.
   - Use explicit lanes: `my_actions`, `waiting_on_others`, `blocked`.

## Recommended Commands (Template Intent)

1. `gm-brief`: Generate daily briefing.
2. `triage-inbox`: Run cross-channel triage and draft queue.
3. `relationship-health`: Surface stale/high-priority contacts.
4. `goal-alignment-check`: Compare today/this-week plan to active goals.

## Exit Criteria

A run is complete only when:
1. Side-effect actions are either approved-and-executed or left pending approval.
2. All recommendations include source references.
3. Queue states are updated without ambiguity.

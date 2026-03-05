# Skill Architecture Protocol

Use this playbook to keep skills composable, low-token, and reusable across projects.

## 1) Context Loading Matrix (Mandatory)

Define what each skill should load and what it should explicitly ignore.

| Skill ID | Must Load | Optional Load | Must Withhold | Rationale |
|----------|-----------|---------------|---------------|-----------|
| example-seo-content | keyword_plan.json, audience_profile.md | brand_voice.md | competitor_dump_raw.md | Keeps generation focused; avoids context dilution |

### TTL Rule

- `< 7d`: load full context.
- `7-30d`: load with freshness warning.
- `30-90d`: load summary only.
- `> 90d`: do not auto-load unless manually approved.

## 2) Schema Contracts Between Skills (Mandatory for Pipelines)

If one skill feeds another, define a typed handoff artifact.

Contract template:

- Producer skill:
- Consumer skill:
- Artifact path:
- Schema path:
- Required keys:
- Validation command:

Example:

- Producer skill: `keyword-research`
- Consumer skill: `seo-content`
- Artifact path: `knowledge/contracts/keyword-plan.json`
- Schema path: `knowledge/contracts/schemas/keyword-plan.schema.json`
- Required keys: `cluster`, `intent`, `priority`, `source`
- Validation command: `jq -e '.cluster and .intent and .priority and .source' knowledge/contracts/keyword-plan.json`

## 3) Learning Loop Categories (Mandatory)

After each major deliverable, log one outcome category in `knowledge/lessons-learned.md`.

- `shipped_as_is`: no meaningful edits needed.
- `minor_edits`: small adjustments before accept.
- `rewrote_significantly`: required major rewrite.

For each learning entry, include:

1. what failed or succeeded
2. repeatable rule to apply next time
3. owner of the rule
4. date

## 4) Anti-Patterns

- dumping all memory into every skill
- free-text handoff where schema is required
- adding skills without owner or lifecycle
- keeping high-value learnings only in chat and not in repo

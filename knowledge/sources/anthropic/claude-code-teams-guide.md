# Anthropic Source Dossier: Claude Code Team Operating Guide

Date captured: 2026-02-17  
Status: `active-reference`  
Source: https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf

## Purpose

Store first-party guidance for how real teams use Claude Code, then translate it into blueprint process rules.

This is a source dossier, not a default runtime integration.

## Verified Themes

## 1. Organization-Wide Adoption Pattern

- The guide frames Claude Code usage as cross-functional (engineering, data, product, security, legal, and growth).
- It emphasizes that teams get value when they treat agents as workflow participants, not just code generators.

Blueprint implication:
- Keep multi-role PM/QA/specialist gates and explicit handoff protocols.

## 2. Data Infrastructure Practices

- Heavy analyst workflows benefit from turning repeated data pulls into reusable tooling surfaces.
- The guide highlights analyst-scale acceleration when repetitive query/cleaning/report loops are standardized.

Blueprint implication:
- Keep analytics work in tool registries and skills, not ad hoc memory notes.
- Require source/timestamp in deliverables for data-backed claims.

## 3. Product Design + Engineering Collaboration

- The guide describes design-to-implementation loops where prototypes and implementation artifacts are tightly coupled.
- It points to reducing handoff friction by using shared artifacts and consistent constraints.

Blueprint implication:
- Preserve explicit role boundaries (PM plans, worker executes, QA validates), but keep one canonical artifact map (`registry/command-center-map.yaml` + docs).

## 4. Security and Governance

- Security workflows are presented as ongoing practice (threat identification, policy enforcement, review), not one-time checks.
- The guide repeatedly favors process controls over trust in model behavior alone.

Blueprint implication:
- Keep hook-based enforcement and CI guard checks as mandatory.
- Treat prose-only policies as insufficient without mechanical gates.

## 5. Legal/Compliance and Growth Use Cases

- Legal/compliance and growth teams are included as legitimate users of the same operating model.
- The document suggests broader organizational use can succeed when output quality and auditability are standardized.

Blueprint implication:
- Keep source dossiers and signal intake lanes so non-engineering workflows still follow evidence and review gates.

## 6. Build-vs-Buy and Rollout Guidance

- The guide discusses tradeoffs in how much to build internally versus using existing tool surfaces.
- It positions iterative adoption and clear ownership as key to successful scaling.

Blueprint implication:
- Keep `tool-stack-profiles.yaml` and MCP registry ownership explicit.
- Start with lean default stacks and add optional tools only when needed.

## 7. Operational Tips (Token/Cost Relevant)

- Reusable workflows and narrow task framing reduce wasted effort.
- Team-level discipline matters more than single prompt cleverness.

Blueprint implication:
- Keep token-cost protocol, Sonnet-first defaults, Opus escalation gate, and memory hygiene boundaries.

## Extracted Rule for This Blueprint

Use this partition to keep costs and context under control:

1. `memory.md`: project state only.
2. `.claude/skills/*`: reusable procedures and execution playbooks.
3. `TOOLS.md` + registries: tool capability, policy, and ownership.
4. `knowledge/sources/*`: external reference intelligence.

## Revisit Triggers

Re-check this dossier when one of these happens:

1. Anthropic publishes a revised edition of this guide.
2. Claude Code introduces materially new agent-governance primitives.
3. Current hooks/PM routing model fails repeated audits in production projects.

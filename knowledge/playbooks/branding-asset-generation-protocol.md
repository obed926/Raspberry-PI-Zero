# Branding Asset Generation Protocol

Use this playbook when a project needs AI-assisted branding output (logos, identity concepts, campaign visuals, social/web assets).

## Activation

1. Select `branding_assets_optional` in `registry/tool-stack-profiles.yaml`.
2. Log the selection in `docs/DECISIONS.md`.
3. Confirm `gemini_assets` policy is active in `registry/mcp-registry.yaml`.

## Agent + Skill Flow

1. `brand-pm` (orchestrator role): defines scope, timeline, acceptance criteria.
2. `brand-strategist` (strategy role): positioning, audience, tone, differentiator.
3. `visual-director` (art-direction role): references, mood boards, style territories.
4. `logo-designer` (identity role): logo concepts, lockups, usage constraints.
5. `brand-system-designer` (system role): color/type/spacing/icon tokens.
6. `copy-director` (voice role): headline/tagline/voice rules.
7. `qa-brand-auditor` (quality role): consistency, readability, anti-generic checks.

If dedicated roles are unavailable in a project, run these as structured role briefs through `master-prompter` + `worker`.

## Mandatory Inputs (Before Generation)

1. Brand brief (audience, business type, trust signals, positioning).
2. Visual references (wireframes/screenshots/mood boards).
3. Constraints (industry fit, tone, compliance/sensitivity requirements).
4. Output matrix (logo, icon, social hero, web hero, ad variants, etc.).

## Generation Rules

1. Visual-first inputs before prompt-only ideation.
2. For images with text: keep in-image text minimal and container-bound.
3. For video: no embedded typography; reserve dead space for overlays.
4. Prefer editable/source-friendly outputs and document prompt metadata.
5. Do not treat first generation as final; run at least one review/refine cycle.

## Deliverables

Store in project `brand/` lanes:

1. `brand/strategy/brand-brief.md`
2. `brand/identity/logo-concepts.md`
3. `brand/system/design-tokens.(md|json)`
4. `brand/copy/voice-and-taglines.md`
5. `brand/assets/` (approved exports)
6. `brand/evals/brand-qa-report.md`

## QA Gate (Must Pass)

1. Strategy fit: visuals match business/audience trust context.
2. Consistency: tokens and style choices align across deliverables.
3. Legibility: logo and typography remain clear at common target sizes.
4. Anti-generic: avoid default template look unless explicitly requested.
5. Traceability: each accepted asset has source prompt + revision note.

## Non-Negotiables

1. No final approval without human sign-off.
2. No claim of trademark clearance without legal review.
3. No public launch assets generated from unverified external references.

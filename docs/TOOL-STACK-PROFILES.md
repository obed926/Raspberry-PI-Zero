# Tool Stack Profiles

Use this file with `registry/tool-stack-profiles.yaml` to bootstrap the default toolset for a new project.

## Goal

Pick one profile first. Install and configure only its required stack. Add optional tools only when the project proves the need.

## Selection Rule

1. Classify project type from the CEO brief.
2. Select the closest `profile_id` in `registry/tool-stack-profiles.yaml`.
3. Record the selected profile in `docs/DECISIONS.md`.
4. Enable required MCPs in `registry/mcp-registry.yaml`.
5. Keep all non-required integrations disabled until explicitly needed.
6. Apply `docs/TOKEN-COST-PROTOCOL.md` defaults before enabling optional tools.

## Available Profiles

1. `seo_agency`
2. `saas_product`
3. `content_media`
4. `ecommerce`
5. `executive_ops_optional` (opt-in profile for chief-of-staff style workflows; not default)
6. `branding_assets_optional` (opt-in profile for image/logo/brand-system generation workflows; not default)

## Installation Order

1. Baseline PM tools: `master-prompter`, `worker`, `qa`
2. Required MCP integrations for selected profile
3. Browser validation tools (`chrome_devtools`, `playwright`) when present
4. Optional evaluation/observability tools only after baseline passes

## Enforcement Notes

1. Router and PM agents stay in planning mode in router topology.
2. `worker-exec` is the only execution lane.
3. Edit/write operations remain protected by `PreToolUse` hooks and `ops-tracker.md` task-state checks.
4. PM briefs must follow `routing/pm-dispatch-contract.md` (objective-only, no worker checklists).

## Drift Control

When tool changes are proposed:

1. Update `registry/tool-stack-profiles.yaml`.
2. Update `registry/tools.yaml` and `registry/mcp-registry.yaml` when IDs change.
3. Add a decision row in `docs/DECISIONS.md`.

## Optional Executive Ops Profile

If a project explicitly wants a chief-of-staff style operating layer, use `executive_ops_optional`.

Rules:
1. This profile is opt-in only and must be explicitly selected in `docs/DECISIONS.md`.
2. Keep outbound actions approval-gated (send/post/create/delete actions require confirmation).
3. Do not hide missing channel coverage; triage output must state which channels were unavailable.
4. Keep queue-state clarity: `my_actions`, `waiting_on_others`, and `blocked` must be distinct.

## Optional Branding Assets Profile

If a project needs AI-assisted branding generation (logos, art direction, campaign assets), use `branding_assets_optional`.

Rules:
1. This profile is opt-in only and must be explicitly selected in `docs/DECISIONS.md`.
2. Apply `knowledge/playbooks/branding-asset-generation-protocol.md` before producing production assets.
3. Keep text rendering minimal in generated imagery and reserve negative space for post-production overlays.
4. Do not ship assets without brand QA checks for consistency, legibility, and anti-generic style rules.

# OpenClaw Plugin and Extension Notes

Primary sources:

1. https://github.com/openclaw/openclaw
2. https://docs.openclaw.ai/docs/extension
3. https://docs.openclaw.ai/docs/command/plugin

## Verified Capabilities (as of 2026-02-15)

1. Plugin manager via slash commands (`/plugin add`, `/plugin list`, `/plugin remove`, `/plugin update`).
2. Extension model with optional private registries.
3. Skills, hooks, and MCP integration support documented in first-party docs.
4. Officially referenced plugin examples include:
   - `openclaw/plugin-voice-call`
   - `openclaw/plugin-msteams`
   - `openclaw/plugin-matrix`
   - `openclaw/plugin-mattermost`
   - `openclaw/plugin-zalouser`

## Adoption Rule

OpenClaw is treated as a source dossier by default in this blueprint. Promote to active tooling only when:

1. A project explicitly selects it in `docs/DECISIONS.md`.
2. Security review is complete.
3. Registry and runbook changes are approved.

## Community Watchlist Signals (2026-02-18)

1. `arscontexta` profile signals indicate emerging markdown-first note/memory plugin patterns for OpenClaw workflows.
2. Keep these as watchlist references until plugin source quality, security posture, and maintenance cadence are verified.

# Tools Map

Purpose: keep tool and integration knowledge out of `memory.md`.

## What Belongs Here

- Tool capabilities and limits.
- Approved use-cases and non-use cases.
- Owner and fallback notes for each integration.
- Allowed data sensitivity tiers (`public`, `internal`, `restricted`) per integration.
- References to canonical registry entries.

## What Does Not Belong Here

- Current sprint status (use `ops-tracker.md`).
- Project-specific temporary notes (use `memory.md`).
- Role SOPs and reusable execution procedures (use `.claude/skills/*/SKILL.md`).

## Canonical Sources

- Tool registry: `registry/tools.yaml`
- MCP registry: `registry/mcp-registry.yaml`
- Tool stack profiles: `registry/tool-stack-profiles.yaml`
- Human-readable profile guidance: `docs/TOOL-STACK-PROFILES.md`

## Starter Active Set

| Tool ID | Class | Primary Use | Notes |
|---------|-------|-------------|-------|
| chrome_devtools | mcp | Browser debugging | Default browser-debug lane |
| playwright | mcp | Deterministic browser validation | Default E2E lane |
| github | mcp | Repo-aware operations | Default for software projects |
| gsc | mcp | Index/search diagnostics | SEO visibility |
| ga4 | mcp | Traffic/conversion diagnostics | Performance trends |
| semrush | mcp | SERP/keyword/competitor research | External market context |
| gemini_assets | creative | Asset generation | Overlay-first SOP |
| promptfoo | evaluation | Prompt/agent regression checks | Optional quality gate |
| langfuse | observability | Runtime traces/evals | Optional monitoring lane |
| mcp_gateway | infra | Multi-MCP routing/policy | Optional for multi-MCP stacks |
| browserbase | mcp | Managed cloud browser sessions | Optional scale lane |

## Update Rule

When a tool changes state:

1. Update `registry/tools.yaml` first.
2. Mirror impact in `registry/tool-stack-profiles.yaml` and `registry/mcp-registry.yaml` when applicable.
3. Log rationale in `docs/DECISIONS.md`.

## Data Sensitivity Tiers

- `public`: non-sensitive information intended for broad sharing.
- `internal`: operational/project information that should stay inside the team/org.
- `restricted`: sensitive data requiring highest control and explicit approval before external actions.

Rule: if a task includes `restricted` data, only use tools/integrations whose registry entry explicitly allows `restricted`.

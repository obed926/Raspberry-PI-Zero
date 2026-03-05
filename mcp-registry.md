# MCP Registry

> Human-facing MCP policy sheet.
> Canonical machine-readable registry: `registry/mcp-registry.yaml`
> Governance rulebook: `.claude/rules/hooks-mcp-governance.md`

## Policy

1. Every MCP must have an owner PM/team.
2. Every MCP must list approved use cases and explicit do-not-use cases.
3. Every MCP-based claim in deliverables must include source + timestamp.
4. Credentials are referenced by location/policy only. Never store secrets here.
5. If data is stale beyond freshness policy, refresh before decision-making.

## Integrations

| Integration | Owner | Data Tiers | Approved Use Cases | Do Not Use For | Freshness Expectation | Fallback Source | Notes |
|-------------|-------|------------|--------------------|----------------|-----------------------|-----------------|-------|
| GitHub MCP Server | Platform PM | public, internal, restricted | Repo context, issues/PR operations, workflow-linked execution | Bypassing branch protections or required reviews | Per operation | Local git + GitHub web UI | |
| GSC MCP | Domain PM | public, internal | Query/page performance, indexing checks | Product analytics attribution | Daily or on-demand | Latest exported report in deliverables/ | |
| GA4 MCP | Domain PM | internal, restricted | Traffic/events/conversion trends | URL indexing diagnostics | Near-real-time monitoring; daily reporting | GA4 scheduled export snapshot | Prefer first-party GA4 MCP when available |
| Semrush MCP | Domain PM | public, internal | SERP, keyword, competitor visibility research | First-party conversion truth | Weekly or campaign cadence | Stored benchmark report | |
| Chrome DevTools MCP | Platform PM | public, internal, restricted | Browser debugging, repro, UI flow diagnosis | Final SEO truth metrics | On-demand per incident/task | Local reproducer notes in deliverables/ | |
| Playwright MCP | Platform PM | public, internal, restricted | Deterministic browser flows, E2E validation steps | Search ranking/analytics truth | Per test run | Existing Playwright test reports | |
| Browserbase MCP (optional) | Platform PM | public, internal, restricted | Managed cloud browser sessions, remote browser QA, reproducible browser runs | Replacing local deterministic test runs when local is sufficient | Per test run | Local Playwright or Chrome DevTools runs | Use when scale/reliability requirements justify managed browser infra |
| Gemini Asset API / MCP (optional) | Domain PM + Creative/Platform | public, internal | Automated image/video generation inside agent workflows | Replacing post-production text layout work | Per campaign or creative sprint | Manual asset generation + checked-in assets | Not required for manual Gemini usage |
| Docker MCP Gateway (optional) | Ops PM | public, internal, restricted | Multi-server MCP routing and policy controls | Overengineering single-MCP projects | On change | Direct per-integration MCP config | Enable only when MCP count/complexity grows |

## Change Log

| Date | Change | Owner | Reason |
|------|--------|-------|--------|

# Ops Tracker

## Status Legend
- `[ ]` Pending | `[~]` In Progress | `[x]` Complete | `[!]` Blocked | `[↩]` Reverted

## Active Engagements
| Engagement | Phase | Health | Last Updated |
|-----------|-------|--------|-------------|
| Scaffold Quality | Audit | On track | 2026-02-15 |

## Tasks
| Task ID | Task | Owner | Status | Outcome |
|---------|------|-------|--------|---------|
| T-002 | Full repo audit (R3) — multi-lens review | orchestrator_pm | [x] | PASS w/ fixes. 0 P0, 2 P1, 3 P2, 2 P3. Report: reports/2026-02-15_full-repo-audit-r3.md |
| T-003 | Fix P1-1: Replace rg with grep in qa-scaffold-consistency.sh | platform_pm | [x] | grep replaces rg. Consistency check now PASSES. |
| T-004 | Fix P1-2: Populate models.yaml with defaults | orchestrator_pm | [x] | Opus (primary), Sonnet (fallback), Haiku (fast). All active. |
| T-005 | Fix P2-1: Add routing targets to agents.yaml | orchestrator_pm | [x] | domain_pm, platform_pm, ops_pm added as templates. |
| T-006 | Fix P2-2: Sync mcp-registry.yaml with mcp-registry.md | domain_pm | [x] | Chrome DevTools + Playwright added to YAML registry. |
| T-007 | Fix P2-3: Deduplicate signals-intake.md | ops_pm | [x] | Root file is now a 3-line pointer to canonical. |
| T-008 | Build initial command-center dashboard UI | worker_exec | [x] | Added static dashboard at deliverables/dashboard/ (index.html, styles.css, main.js) reading map/log sources. |
| T-009 | Harden dashboard serving for pi-zero.local root URL | worker_exec | [x] | Added root redirect index and dashboard local data fallbacks under deliverables/dashboard/data/. |
| T-010 | Add interactive dashboard widgets (filters, run stats, refresh) | worker_exec | [x] | Added widget controls for lane/type/search filtering, refresh now/auto refresh interval, and snapshot metrics in dashboard UI. |
| T-011 | Add dedicated RTAH OP App section to dashboard | worker_exec | [x] | Added dedicated RTAH OP App panel with deployment details and operational snapshot from run logs. |
| T-012 | Feed RTAH OP App panel with real project snapshot data | worker_exec | [x] | Added dashboard data source `deliverables/dashboard/data/rtah-op-app.json` and wired RTAH panel to render real app snapshot metrics/highlights. |
| T-013 | Add Live Testing link to RTAH OP App dashboard section | worker_exec | [x] | Added clickable `live_testing_url` in RTAH panel and deployed to Pi dashboard path. |
| T-014 | Fix RTAH live redirect loop on nested /public path | worker_exec | [x] | Switched to absolute redirect, added Nginx collapse rule for repeated `/public/` segments, and updated dashboard live URL with cache-busting query. |
| T-015 | Add Public Link field to RTAH OP App dashboard section | worker_exec | [x] | Added `public_url` in dashboard data, rendered clickable Public Link in RTAH panel, and deployed to Pi dashboard web root. |
| T-016 | Force dashboard JS cache-bust so Public Link appears in browser | worker_exec | [x] | Added versioned dashboard script URL (`main.js?v=20260306b`) and deployed updated index to Pi web root. |
| T-017 | Auto-refresh RTAH public tunnel URL in dashboard panel | worker_exec | [x] | Dashboard now reads `/rtah-op-live/data/tunnel-status.json`; Pi timer updates URL every 30s from tunnel log and mirrors it to dashboard data path. |
| T-018 | Prepare stable public deployment path (Vercel) and wire dashboard public link | worker_exec | [x] | Published RTAH app to `https://rtah-op-app.vercel.app`, updated dashboard public URL and render priority, and deployed updated dashboard files to Pi web root. |
| T-019 | Add separate stable testing URL surface in dashboard | worker_exec | [x] | Added dedicated testing URL `https://rtah-op-app-testing.vercel.app` in RTAH dashboard data/panel and bumped dashboard JS cache-bust. |
| T-020 | Refresh Command Center RTAH links and force dashboard cache refresh | worker_exec | [x] | Normalized live testing link, preserved separate testing/public Vercel links, bumped dashboard script version to `20260306f`, and deployed to Pi web root. |
| T-021 | Redesign Command Center visual theme to modern dark gray with chartreuse accents | worker_exec | [x] | Reworked dashboard look to dark graphite + chartreuse accent system, added modern typography, bumped CSS cache-bust to `20260306g`, and deployed to Pi web root. |
| T-022 | Add iPhone-style weather widget to Command Center | worker_exec | [x] | Added weather widget UI + Open-Meteo live data fetch with location input, updated dashboard asset versions (`main.js?v=20260306g`, `styles.css?v=20260306h`), and deployed to Pi web root. |
| T-023 | Rework weather widget for Houston-first iPhone-style 24-hour + 5-day forecast | worker_exec | [x] | Set Houston as fixed primary weather source, added 24-hour hourly strip + 5-day forecast rows, removed location input, bumped dashboard assets to `main.js?v=20260306i` and `styles.css?v=20260306i`, and deployed to Pi web root. |
| T-024 | Hide non-weather widgets in Command Center (filters/refresh/snapshot) | worker_exec | [x] | Hidden Filters/Refresh/Snapshot widget boxes via `widget-hidden` class while preserving DOM hooks; bumped CSS cache-bust to `20260306j` and deployed to Pi web root. |
| T-025 | Add Houston allergy forecast widget and wire Command Center public-access workflow | worker_exec | [x] | Added AccuWeather-backed Houston allergy widget + data updater script, added Command Center Access panel, deployed dashboard updates to Pi, and published globally reachable dashboard at `https://dashboard-five-theta-88.vercel.app`. |

## Guardrail Incidents

| Incident ID | Date | Severity | Trigger | Task ID | Owner | Status | Resolution |
|-------------|------|----------|---------|---------|-------|--------|------------|
| INC-001 | 2026-02-16 | important | Edit/Write hook allowed task-state but not file scope | T-008 | ops_pm | [x] | Added scope enforcement (`check-scope.sh`) and CI regression check. |

## Agent Log Linkage

- Canonical run log: `knowledge/agent-logs/agent-runs.csv`
- Logging command: `scripts/log-agent-run.sh`

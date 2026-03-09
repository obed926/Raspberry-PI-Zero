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
| T-026 | Refocus Command Center into quick-access daily hub layout | worker_exec | [x] | Added quick-access links panel + configurable `quick-access.json`, kept weather/allergy as daily essentials, moved engineering panels behind toggle, and deployed updated dashboard files to Pi web root. |
| T-027 | Add JW section with 2026 Convention quick-open workflow and move Quick Access to bottom | worker_exec | [x] | Added JW section below Daily Essentials with 2026 Convention actions (mobile Drive app deep link, desktop Finder path attempt, copy-path helper), moved Quick Access card to bottom, and deployed updates to Pi web root. |
| T-028 | Add Contracts Team public-link quick action in JW section | worker_exec | [x] | Added Contracts Team button + visible link row for `https://rtah-op-app.vercel.app` in JW section, then redeployed to Pi and Vercel alias. |
| T-029 | Add NotebookLM quick link to Contracts Team subsection | worker_exec | [x] | Added NotebookLM button + URL row under Contracts Team, then redeployed to Pi and Vercel alias. |
| T-030 | Add Contracts subsection chat feature | worker_exec | [x] | Added local persistent Contracts Team chat (send, enter-to-send, clear chat) using browser storage, then redeployed to Pi and Vercel alias. |
| T-031 | Improve Contracts NotebookLM launch UX for quick testing | worker_exec | [x] | Added prominent Ask NotebookLM button in Contracts Team with popup-open behavior and tab fallback; redeployed to Pi and Vercel alias. |
| T-032 | Make allergy widget refresh pull live data each time | worker_exec | [x] | Added live Open-Meteo Houston pollen fetch on allergy refresh with fallback to local AccuWeather snapshot JSON; deployed to Pi and Vercel alias. |
| T-033 | Remove weather/allergy update buttons and unbox essentials layout | worker_exec | [x] | Removed weather/allergy update buttons, removed Daily Essentials card heading/box, rendered both widgets directly in top-level layout, and redeployed to Pi + Vercel alias. |
| T-034 | Replace top command-center hero with JW Daily Text panel | worker_exec | [x] | Replaced hero copy with dynamic JW Daily Text (date, verse, commentary, source link), added live daily feed parse with local fallback JSON, and redeployed to Pi + Vercel alias. |
| T-035 | Speed up JW Daily Text load time on dashboard open | worker_exec | [x] | Added cache-first Daily Text rendering (localStorage), background live refresh with timeout, and fallback retention; deployed to Pi + Vercel alias. |
| T-036 | Fix Daily Text not loading by using generated local data source | worker_exec | [x] | Added `scripts/update-jw-daily-text-json.sh`, generated real Daily Text JSON, switched dashboard to local JSON load path with cache, and redeployed to Pi + Vercel alias. |
| T-037 | Add English/Spanish toggle for Daily Text (English primary) | worker_exec | [x] | Added EN/ES Daily Text toggle with English default, language-specific caches and source links, generated `jw-daily-text-en.json` + `jw-daily-text-es.json`, and redeployed to Pi + Vercel alias. |
| T-038 | Replace Daily Text language buttons with single EN/ES switch | worker_exec | [x] | Replaced two language buttons with single EN/ES switch (English default), updated switch bindings/state persistence, and redeployed to Pi + Vercel alias. |
| T-039 | Remove Engineering Panels from Command Center UI | worker_exec | [x] | Removed engineering toggle and all engineering panel sections from UI, hardened JS for missing controls, and redeployed to Pi + Vercel alias. |
| T-040 | Make Daily Text refresh pull latest live source on dashboard refresh | worker_exec | [x] | Re-enabled live JW Daily Text fetch via r.jina on each dashboard refresh (EN/ES), added timeout handling + parser hardening, kept local JSON fallback/cache path for resilience. |
| T-041 | Fix Daily Text date drift by selecting today from date-specific JW feed | worker_exec | [x] | Switched live fetch to date-specific JW URLs (`/wol/h/.../YYYY/M/D`), parse-selects today entry (EN/ES), updated fallback generator to same source, and bumped dashboard JS cache version. |
| T-042 | Speed up Daily Text EN/ES toggle responsiveness | worker_exec | [x] | Added per-language cache read/write helpers, instant cache-first render on toggle, background live refresh, and opposite-language prefetch to reduce switch latency. |
| T-043 | Fix Daily Text toggle race causing laggy/weird language flips | worker_exec | [x] | Added request-sequence guard + language-scoped refresh path and per-language fetched timestamps so stale async responses cannot overwrite active EN/ES toggle state. |
| T-044 | Simplify JW Daily Text hero UI and link heading to WOL | worker_exec | [x] | Removed Daily Text source button + `updated_on/nodes/edges` pills from hero, linked `JW Daily Text` heading to `https://wol.jw.org/en/`, and bumped JS cache-bust version. |
| T-045 | Redesign JW 2026 Convention card for simpler workflow | worker_exec | [x] | Redesigned 2026 Convention card with cleaner hero style, compact status/link row, focused action buttons, and a simplified Finder path display; bumped CSS/JS cache versions. |
| T-046 | Improve macOS convention open flow when Finder launch is blocked | worker_exec | [x] | Added macOS-specific convention open flow: auto-copy Finder path, attempt local file open, then Drive app and web fallbacks with clearer user hint text. |
| T-047 | Make 2026 Convention open flow Safari-safe | worker_exec | [x] | Added Safari-specific handling to skip invalid local/app scheme launches, auto-copy Finder path, and open Drive web fallback with clearer instructions. |
| T-048 | Platform-specific convention launch behavior (Mac Finder vs iOS Drive app) | worker_exec | [x] | Updated platform flow: Mac desktop now attempts Finder folder open first (no forced web redirect), while iPhone/iPad opens Google Drive app with web fallback. |
| T-049 | Stop iOS Drive app fallback from forcing Safari popup | worker_exec | [x] | Added visibility/pagehide-aware fallback so iOS/iPad only opens web when Drive app handoff fails; prevents Safari popup after successful app launch. |
| T-050 | Fix iPhone folder targeting + Mac Finder gesture handling | worker_exec | [x] | Switched iPhone/iPad flow to universal Drive folder link for in-app folder targeting and reordered Mac Finder launch before clipboard async work to preserve user-gesture context. |
| T-051 | Add macOS Shortcut helper for reliable Finder open | worker_exec | [x] | Added Mac shortcut-run flow (`shortcuts://run-shortcut`) using named helper, surfaced helper name in UI, and added setup guidance + copied-path fallback when shortcut is missing. |
| T-052 | Make Mac shortcut launcher tolerant to name/scheme mismatches | worker_exec | [x] | Switched to `shortcuts://x-callback-url/run-shortcut` and added automatic fallback attempt using alternate shortcut name (`Open2026Convention`) before setup guidance. |
| T-053 | Prefer direct Finder open on Mac before Shortcut fallback | worker_exec | [x] | Updated Mac flow to try direct `file://` Finder open first (avoids Shortcut app when permitted) and only run shortcut fallback when direct open is blocked. |
| T-054 | Make Mac convention button run shortcut directly | worker_exec | [x] | Removed direct Finder launch step for Mac and now runs the configured shortcut immediately via `shortcuts://x-callback-url/run-shortcut`. |
| T-055 | Simplify 2026 Convention card to single primary action | worker_exec | [x] | Reduced 2026 Convention card to one button and renamed it to `2026 Convention Google Drive`; removed extra controls/details from that card. |
| T-056 | Add Personnel List button and exported-sheet viewer page | worker_exec | [x] | Added `Personnel List` button in the 2026 Convention card and created `personnel-list.html` that fetches the Personnel List tab via Google Sheets CSV export and renders it as a table with source fallback link. |

## Guardrail Incidents

| Incident ID | Date | Severity | Trigger | Task ID | Owner | Status | Resolution |
|-------------|------|----------|---------|---------|-------|--------|------------|
| INC-001 | 2026-02-16 | important | Edit/Write hook allowed task-state but not file scope | T-008 | ops_pm | [x] | Added scope enforcement (`check-scope.sh`) and CI regression check. |

## Agent Log Linkage

- Canonical run log: `knowledge/agent-logs/agent-runs.csv`
- Logging command: `scripts/log-agent-run.sh`

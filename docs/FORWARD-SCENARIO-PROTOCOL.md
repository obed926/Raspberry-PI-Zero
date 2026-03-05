# Forward Scenario Protocol

Use this protocol to think ahead before issues hit production, cost, or stability.

## Objective

Run a structured pre-mortem so agents identify likely failures early and convert them into enforceable controls.

## Trigger Conditions

Run this protocol when one is true:

1. Weekly for active projects.
2. Before major architecture or agent-topology changes.
3. After any crash, runaway token spike, or routing failure.
4. Before enabling new MCP integrations or adding 2+ new agents.

Scheduled automation: `.github/workflows/forward-scenario-scan.yml` runs weekly and on manual dispatch to generate a scan template artifact.

## Lenses (Run All)

1. Cost Ops
2. Runtime Reliability
3. Architecture
4. Hooks Governance
5. PM Orchestration
6. MCP Efficiency
7. Security
8. Evidence QA

## Output Contract

Write one report to `reports/YYYY-MM-DD_forward-scenario-scan.md` with:

1. Top scenarios by severity.
2. Early warning signals for each scenario.
3. Preventive controls.
4. Detection checks (script/test/log signal).
5. Owner and deadline.

## Scenario Quality Bar

A scenario is valid only if it includes:

1. Concrete trigger condition.
2. Observable signal (log, metric, test, or command output).
3. Deterministic mitigation (hook, script, policy, or architecture rule).
4. Verification step.

## Mandatory Categories

1. Token burn and cost runaway
2. Context-window overload
3. Hook bypass or governance drift
4. MCP sprawl/idle overhead
5. Crash amplification from oversized local artifacts
6. PM routing confusion and role leakage
7. Documentation-to-runtime drift
8. Security boundary regressions
9. Source fallback-chain failure (primary API unavailable, stale fallback, or missing attribution)
10. Approval-gate bypass for side-effect actions
11. Recommendation synthesis bias (specialists influencing each other before independent output)
12. Queue-state ambiguity (`waiting_on` vs `blocked` vs `owned`) causing missed follow-up

## Escalation Rule

If any scenario is P0/P1 with no deterministic mitigation, block release and create a fix task in `ops-tracker.md`.

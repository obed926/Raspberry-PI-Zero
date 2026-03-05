# Orchestrator Routing Policy

## Default Mode

Use one orchestrator PM and role skills for all work.

## Escalation to Multi-Team PM Mode

Enable multiple PMs only when one or more conditions are true:

1. Repeated routing errors across distinct workstreams.
2. Context size regularly exceeds practical limits for single PM operation.
3. Distinct teams require separate permissions, tooling, or compliance controls.

## Router Rules

1. Router assigns work to exactly one owning PM.
2. Cross-team tasks must define a primary owner PM and one supporting PM.
3. Team PMs are planning-only; implementation is delegated to `worker-exec`.
4. QA and specialist gates remain sequential per owning PM.
5. PM dispatches must follow `routing/pm-dispatch-contract.md` (objective-based brief, no worker-level steps).

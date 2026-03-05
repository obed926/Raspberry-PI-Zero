# Review Routing Matrix

| Condition | Required Lens |
|-----------|---------------|
| External inputs, state transitions, tool actions | Breaker |
| Auth, secrets, trust boundaries, dependencies | Security |
| Multi-team interactions, unclear ownership, scaling changes | Architecture |
| Slow pipelines, flaky behavior, error recovery gaps | Performance/Reliability |
| Large or risky changes | Use all four lenses |

When in doubt, include more lenses and tighten scope.

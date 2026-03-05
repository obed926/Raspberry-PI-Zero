# Review Report Schema

Every reviewer returns this exact structure:

```yaml
reviewer: <lens-name>
scope: <what was reviewed>
verdict: pass | fail
critical_findings:
  - id: <short-id>
    severity: P0 | P1 | P2 | P3
    confidence: 0.0-1.0
    evidence: <file/path or reproducible observation>
    impact: <why this matters>
    required_change: <what must change>
missing_items:
  - <blind spot not evaluated by implementation/QA>
enhancements:
  - <upgrade that would improve quality, reliability, or speed>
residual_risks:
  - <risk that remains after changes>
recommended_actions:
  - priority: 1
    action: <concrete next step>
```

PM merges reports by severity, then by confidence.

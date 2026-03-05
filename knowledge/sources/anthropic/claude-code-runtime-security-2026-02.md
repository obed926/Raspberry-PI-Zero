# Anthropic Source Dossier: Claude Code Runtime + Security (2026-02)

Date captured: 2026-02-21  
Status: `active-reference`

## Sources

1. https://www.anthropic.com/news/claude-code-security
2. https://www.anthropic.com/news/claude-code-on-the-web
3. https://www.anthropic.com/engineering/claude-code-sandboxing

## Purpose

Capture first-party runtime/security constraints that affect blueprint design decisions.

## Verified Claims

1. Claude Code security controls (policy controls, review patterns) are a first-class concern, not optional add-ons.
2. Web/runtime availability is staged (preview/research-preview context), so feature assumptions must include capability checks.
3. Sandboxing boundaries matter: filesystem/network controls and isolation are explicit operating primitives.
4. Human approval gates remain central for sensitive actions.

## Blueprint Implications

1. Keep hooks and CI gates as mandatory mechanical controls; do not rely on prompt-only behavior.
2. Treat runtime-specific features as optional until capability is confirmed in the current environment.
3. Keep deterministic fallback paths documented for all external integrations.
4. Maintain "approval before side effects" for deploy/send/delete and other irreversible operations.
5. Keep token-cost controls active (`sonnet` default + Opus gate + compaction loop) because preview/runtime variance can increase retries.

## Revisit Triggers

1. Anthropic moves the relevant features from preview to GA.
2. New runtime primitives are introduced (for example stronger per-agent enforcement metadata).
3. Security model or sandboxing defaults materially change.

# UI Vibe Design Protocol

Use this playbook for frontend/design tasks where generic AI output quality is unacceptable.

## Goal

Drive high-quality, brand-fit UI output by giving visual constraints before code generation.

## 1) Visual-First Input (Mandatory)

1. Sketch first, prompt second:
   - Create a quick wireframe (for example Excalidraw).
   - Pass it as structure anchor: "follow this structure exactly."
2. Reference screenshots, not adjectives:
   - Provide section-level references (hero, nav, pricing block, etc.).
   - Ask for style transfer from concrete references.
3. Use a palette board:
   - Provide a visual mood/palette board.
   - Require palette extraction before UI generation.

## 2) Pre-Code Design System (Mandatory)

Before implementation, define:

1. color tokens
2. typography scale
3. spacing scale
4. corner radius and shadow system
5. icon family

Store these in project artifacts before any full-page build.

## 3) Anti-Generic Rules (Mandatory)

1. Ban default "AI template" stacks unless explicitly requested:
   - overused gradient-heavy hero patterns
   - default `Inter` + generic icon combo when not brand-fit
2. Require industry-fit visual language:
   - style must match business trust/context, not novelty.
3. Require consistency checks across pages:
   - no component style drift between routes.

## 4) Communication Protocol

1. For UI tasks, visual references are primary input.
2. Text prompts are secondary and should specify constraints, not vague taste.
3. If visual references are missing, generate low-fidelity wireframes first and get approval.

## 5) Verification Before Done

Do not mark design tasks complete until:

1. structure follows approved wireframe
2. design tokens are consistent across sampled pages/sections
3. typography and icon choices are intentional and documented
4. QA review confirms no "generic template drift"

## Notes

This protocol is based on verified-secondary guidance (user-provided full transcript from social source) and should be combined with project-specific brand requirements.

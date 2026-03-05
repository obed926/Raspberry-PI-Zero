# Asset Generation SOP (Minimal Text, Overlay-First)

> Goal: generate high-fidelity visual assets with minimal in-model text and intentional negative space so final marketing copy is applied in post-production.

## Core Directive

1. Image text target: 1-3 words max.
2. Video text target: 0 in-frame words by default.
3. Long copy belongs in post-production overlays, not in generated pixels.
4. Prefer composition and camera language over typographic storytelling.

## Scope and Terms

1. Applies to Gemini image generation workflows (including "banana" workflows) and Veo video workflows.
2. Applies to ad creatives, social assets, and landing visuals where readable brand text matters.
3. Treat model IDs as configuration, not hardcoded constants. Providers rotate names frequently.

## Part 1: Image Generation (Gemini / Imagen-class APIs)

### Text Payload Rule

1. If user requests long copy, reduce to one short hook in-image.
2. Keep text concrete and short; do not pass full headlines/paragraphs to the model.

### Quotation Anchor (Image Only)

1. Any in-image text must be wrapped in double quotes.
2. Place text on a physical object, never floating in open air.

Example:
`A modern coffee shop storefront. A wooden sign above the door reads "EZQ" in clean sans-serif lettering.`

### Container Rule

Text must sit on a real surface:
- billboard
- package label
- storefront sign
- shirt print
- phone/laptop screen
- poster or lightbox

### Negative Space Protocol (Long Copy Requests)

If request includes a sentence or paragraph:

1. Remove long copy from the generation prompt.
2. Generate a blank but intentional container for overlays.
3. Reserve a clean overlay zone (top third, side panel, or center card).
4. Return in `blank-for-overlay` mode.

Example:
`A yellow taxi driving through a city at dusk. The rooftop billboard is clean and blank, with uninterrupted white space for later graphic overlays.`

### Optional Readability Constraints

When short text is truly required, append constraints:
- `clean edges`
- `high contrast text area`
- `simple sans-serif`
- `centered text block`

## Part 2: Video Generation (Veo or Similar Video APIs)

### Zero-Text Default

1. Do not request printed words/signage in moving frames unless explicitly required.
2. Video text is unstable across frames; prefer overlay in edit.
3. Avoid quotation-marked words in Veo prompts unless testing text rendering on purpose.

### Cinematic B-Roll and Dead Space

Compose shots with stable overlay-friendly areas:
- clear sky region
- clean wall
- defocused background plate
- negative space in top/lower third

Example:
`Slow dolly push toward a steaming cup of coffee on a table. The background is a dark, soft-focus wall with clean negative space in the top third. Cinematic lighting, 4k.`

### Camera Direction Rule

Drive narrative with shot language:
- static wide
- pan left/right
- dolly in/out
- crane/drone reveal
- rack focus

## Part 3: Fallback Policy (Mandatory)

If output includes scrambled letters or typographic artifacts:

1. Retry 1: reduce to one-word text payload.
2. Retry 2: keep one-word payload and add readability constraints.
3. Retry 3: force blank container and mark `post-overlay-required`.

Stop after 3 attempts and escalate if legal/regulatory text is required in-frame.

## Quality Gate (Pass/Fail)

Fail asset if any of these are true:

1. Text is gibberish, warped, or unreadable.
2. Overlay zone is cluttered or low contrast.
3. Text appears floating with no physical container (image mode).
4. Video frame has unstable or morphing text artifacts.

Pass asset only when:

1. Composition is clean and on-brief.
2. Overlay zone is clearly usable.
3. Text policy (`minimal-text` or `blank-for-overlay`) is satisfied.

## Output Metadata (Required)

Every asset handoff must include:

1. Source provider and model ID
2. Prompt sent
3. Timestamp (UTC)
4. Text mode (`minimal-text` or `blank-for-overlay`)
5. Overlay zone (`top-third`, `center-card`, `right-panel`, etc.)
6. Retry count and fallback path used

## Validation References (Checked 2026-02-15)

1. Google AI Studio image prompting guide: https://ai.google.dev/gemini-api/docs/image-prompt-guide
2. Gemini image generation docs: https://ai.google.dev/gemini-api/docs/image-generation
3. Veo prompting guide: https://cloud.google.com/vertex-ai/generative-ai/docs/video/video-gen-prompt-guide

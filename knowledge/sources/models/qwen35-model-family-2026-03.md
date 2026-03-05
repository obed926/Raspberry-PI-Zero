# Qwen 3.5 Model Family Dossier (2026-03)

Status: `active-reference`  
Last verified: 2026-03-02

## Scope

Independent model intelligence dossier for the Qwen 3.5 family.  
This is not a default blueprint runtime decision by itself.

## Primary Sources

1. https://modelscope.cn/collections/Qwen/Qwen35
2. https://huggingface.co/collections/Qwen/qwen35
3. https://huggingface.co/api/collections/Qwen/qwen35
4. https://huggingface.co/Qwen/Qwen3.5-35B-A3B
5. https://huggingface.co/Qwen/Qwen3.5-122B-A10B
6. https://huggingface.co/Qwen/Qwen3.5-27B
7. https://huggingface.co/Qwen/Qwen3.5-0.8B

## Family Snapshot

Collection size observed: 17 models.

### Dense Variants

1. `Qwen3.5-0.8B` (+ Base)
2. `Qwen3.5-2B` (+ Base)
3. `Qwen3.5-4B` (+ Base)
4. `Qwen3.5-9B` (+ Base)
5. `Qwen3.5-27B` (+ FP8)

### MoE Variants

1. `Qwen3.5-35B-A3B` (+ FP8, Base)
2. `Qwen3.5-122B-A10B` (+ FP8)
3. `Qwen3.5-397B-A17B` (+ FP8)

## Verified Technical Signals

1. License reported on sampled model cards: `apache-2.0`.
2. Pipeline tag in collection entries: `image-text-to-text`.
3. Agentic/tool-call documentation is explicit in model cards (vLLM/SGLang tool call examples, Qwen-Agent usage).
4. Context lengths:
   - family docs repeatedly state native `262,144` context
   - larger variants document extension path up to about `1,010,000` tokens with rope/yarn configuration changes

## Strengths (Evidence-Based)

1. Broad size range (sub-1B to ~400B-class) enables cost/latency tiering.
2. Strong documented agentic usage patterns (tool calling, MCP-style workflows in examples).
3. Multimodal interface (`image-text-to-text`) across family.
4. Long-context operation is first-class in docs, not only marketing text.
5. Open weights + Apache licensing make self-hosted evaluation practical.

## Weaknesses and Risks

1. Operational complexity rises sharply for larger MoE variants (infra and serving cost).
2. Long-context extension requires advanced serving configuration, not plug-and-play defaults.
3. Smallest tier caution: model card for `0.8B` explicitly warns about potential thinking-loop behavior under some settings.
4. Family-level benchmark claims are broad; project-specific eval is still required before adoption.
5. Public collection metadata can drift quickly; periodic revalidation is mandatory.

## Deployment and Integration Notes

1. Treat Qwen 3.5 as an optional runtime lane, not default replacement for baseline blueprint models.
2. Tiering guidance:
   - `0.8B/2B/4B/9B`: lightweight classification/routing/draft tasks
   - `27B`: general execution candidate
   - `35B-A3B`: heavier reasoning/agent workflows
   - `122B+`: escalation-only, cost-sensitive scenarios
3. Prefer instruct variants for runtime use; reserve base variants for training/fine-tuning workflows.
4. FP8 variants should be treated as deployment-optimization choices, not separate behavioral policies.

## Recommended Blueprint Decision Posture

1. Keep status as `active-reference` until benchmark evidence is captured in project evaluations.
2. Only promote to active runtime in a project when:
   - evaluation matrix passes required gates
   - latency/cost envelope is acceptable
   - safety/quality checks match or exceed baseline

## Revisit Triggers

1. New Qwen 3.5 release or major card update.
2. Major API/runtime availability change in serving providers.
3. Significant benchmark delta in project-relevant tasks.
4. Any production incident attributable to model behavior.

## What is Still Unknown (Needs Per-Project Eval)

1. Best tier for your real workload mix under your infra budget.
2. Reliability under your exact tool-calling and long-context patterns.
3. Net cost-per-successful-task versus current baseline models.

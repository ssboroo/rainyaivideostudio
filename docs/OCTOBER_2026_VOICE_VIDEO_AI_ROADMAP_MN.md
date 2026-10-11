# RAINY Studio — 2026-10-11 verified AI opportunity and credit rollout

## What exists (as inspected, NOT a promise of working provider access)

- RAINY Video: Next.js/Higgsfield SDK, server-side quote + reservation + ledger + refund, prepaid packages, Genjutsu server-trimmed clip proof, multi-scene movie production, YouTube editor.
- RAINY Voice: Eleven v4 text-to-dialogue, Dubbing v2, Scribe v2, realtime transcription, voice changer, voice clone, music/sfx. Independent billing and provider accounting.
- These are two DIFFERENT wallets; never imply credits transfer automatically without a documented cross-service ledger and signed payment flow.

## Verified new launches in October (release date ≠ account API entitlement)

| Source/release | Date | Buildable differentiated RAINY offering | API status/restriction |
|---|---|---|---|
| Higgsfield Ads Studio `higgsfield/ads-studio/v1.0` | Oct 7 | One-brief product advertising image workflow, agency preset, Mongolian copy | Token-metered text+images, provider true-up. Do NOT expose paid generator until request-usage reconciliation is implemented |
| ElevenCreative Brand Kit | Oct 9 | Brand identity (logo, colors, fonts, rules, refs) shared by Voice+Video projects | Product feature at ElevenCreative, NOT evidence of a third-party Brand Kit API. Build own brand asset schema |
| ElevenAgents Architect | Oct 6 | Mongolian voice-agent QA playground, regression tests, outcomes review | ElevenAgents product. Do NOT advertise Architect as embeddable API without docs/license |
| ElevenAgents synthetic voice detection | Oct 9 | Safety/consent check for caller / cloned-voice workflow | Agent-side feature, external API entitlement not proven |
| Eleven v4 + v4 Turbo | Sep 28 (updated Oct 5) | Long-form emotional Mongolian narration, multi-speaker dialogue, realtime concierge | Voice app already documents v4. v4 Turbo websocket for low latency; verify credit pricing and deploy separately |
| Seedance 2.5 / Genjutsu / Kling 3.0 | Released earlier in 2026 | Multi-shot director, reference motion, Youtube-to-licensed-short derivative, social variants | Already included in Video catalogue. Video source costs require verified input duration; no automatic cheap fixed-price quote |

Sources:
- https://open.higgsfield.ai/models/higgsfield/ads-studio/v1.0/playground
- https://elevenlabs.io/blog/introducing-brand-kit
- https://elevenlabs.io/blog/elevenagents-architect
- https://elevenlabs.io/blog/synthetic-voice-detection-and-personal-agent-protocol
- https://elevenlabs.io/docs/changelog/2026/9/28
- https://open.higgsfield.ai/models/bytedance/seedance-2.5/reference-to-video/playground

## PRIORITY 1 — Revenue-first product differentiation

1. One-click Mongolian ad producer: product photos + campaign brief -> branded scenes + voiceover -> subtitles -> 9:16/1:1/16:9 MP4; create user-owned RAINY Brand Kit and shared asset identity.
2. Cross-app signed project transport: Video holds shot references and render IDs; Voice provides consented narration/dubbing; save billing transaction IDs and exact provider usage per stage, not a shared unbacked balance.
3. Clip-first editor: user-owned/licensed MP4 -> actual video duration/format -> precise trim -> Genjutsu or editing. Download from third-party sources only where permitted.
4. Quality gates: Mongolian subtitle timestamp verification, per-speaker pauses/phonemes and bilingual audio QA, scene continuity, manual approve/redo.
5. Preset marketplace for Mongolia (restaurant, real estate, SME, agency) with approved prices per endpoint.

## Credit engineering — no misleading prices

- Exact input shape and account-specific provider prices before showing a quote; use provider-specific metering type (per-second, per-image/batch, generated tokens, source + generated video seconds, or actual usage tokens).
- Source video workflows: quote only when duration proven with trusted server media tools. Until then disable generate, never replace unknown input duration with arbitrary output duration.
- Token usage after completion: reserve a customer-approved *upper bound* atomically, finalize against provider usage, refund unused reserved budget, and hold unexpectedly large deltas for review. Do not treat a static $0.084/image marketing example as a binding API bill.
- Discounts and website subscriptions never substituted for Higgsfield API bills.
- Payment -> grant only after verified webhook; immutable ledger, idempotent provider submission; cancellation and failed jobs reconcile against final provider state.
- Invoice comparisons and stress: model+variant+resolution+fps+duration+audio+references+input tokens+output tokens, FX, tax/fees, retries, overage.
- Emergency kill switch `RAVS_PRICING_HOLD=true`; only audited operations should be available.
- Code change in this branch: `estimateCredits` can no longer fabricate an output duration for endpoints without a documented `duration` parameter. This deliberately restricts some models until a reliable tariff exists.

## Priority 2

- Ads Studio: add as **catalog / coming after pricing-reconciliation**, then implement usage meter and explicit cap.
- Agency workspaces: brand-scoped usage statements, per-member budgets, approval queue, usage-limit alerts, monthly invoice.
- Revenue reporting: FX-stressed contribution per provider job, no fabricated 100% net profit claims.

## Release acceptance criteria

- All priced model requests roundtrip same canonical `quoteValidatedGeneration` and reservation path.
- No checkout makes new credits before signature and provider confirmation.
- Show *pricing unavailable* on unpriceable variants; do not charge.
- CI tests for source duration, image batch, refunds/idempotency, expired grants, plan floor.
- Compare paid provider invoices to observed jobs before marking financial data verified.

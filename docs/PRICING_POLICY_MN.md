# RAINY Video API pricing — 2026-10-11

## What is billed
- The Higgsfield API is separately billed in USD per successfully completed provider generation. Higgsfield website subscriptions or Unlimited allowances **do not** pay for RAVS API requests.
- RAVS credit quote and actual reservation share \`quoteValidatedGeneration\`. Quote requests do not make paid provider calls.
- USD→MNT 3,900 is an **internal forecast**, NOT an FX quote, and may drift.
- At every generation the server checks model schema, dimensions/duration, price, available credits, account rate-limit, idempotency key and the user's approved \`maxCredits\`.
- Provider acceptance uncertainty is not automatically retried. Failed/canceled/NSFW final states get an idempotent credit refund (subject to the expiry rules of purchased grants).
- For Genjutsu, only provider uploads prepared from owned/licensed MP4 and backed by a per-user signed, URL-bound, expiring duration proof receive an API price quote. An unverified YouTube URL is never billable input.

## Customer price improvement
Previous provider cost multiplier: \`2.15\` (115% markup).
New provider cost multiplier: \`1.90\` (90% markup).
Nominal credit reduction for the same provider cost: \`1 − 1.90 / 2.15 ≈ 11.63%\` **before integer rounding**.
Credits bought in existing packs are not reduced. Generation costs decrease; package prices stay the same.

## Risk budget (internal illustrative scenario, not audited net profit)
Stress assumptions: USD 3,900; FX +10%; payment fees reserve 4%; possible tax 10%; hosting/retry/ops reserve 7%.
Current bundle floor is >=9.25 MNT/credit. The least favorable default Studio pack (449,000₮ for 48,000 credits) has approx 27.4% illustrative contribution after those reserves and >50% markup over FX-stressed provider cost.
**These reserves are assumptions, not verified payment-provider fees, tax obligations, FX spot or Higgsfield discounts.**
Stop and reprice before activating any undocumented model/options. The emergency RAVS_PRICING_HOLD variable stops credit-charging generation quotes.

## Cost minimization
Use \`/api/pricing/economy\` on text-to-video requests to compare verified RAINY credit costs for models that support the **same duration, resolution, aspect ratio and requested audio**. If the user changes those requirements, explain that comparisons are no longer like-for-like.
Expensive effects and workflows (Genjutsu, video edit/extend, Movie Composer) do not have directly equivalent cheap text-to-video substitutes.

## Live checks before lowering price again
1. Verify current provider API playground prices by the exact endpoint/variant, including audio and resolution. Historical promotional prices can be misleading.
2. Recalculate the minimum margin against the actual MNT FX and payment fee from statements and tax treatment from accountant.
3. Run pricing tests and model audit report, compare recent paid provider invoices for any underquoted model.
4. Update \`reviewedAt\` whenever rates have really been rechecked.
5. If any model cost cannot be verified, fail closed for that configuration rather than quoting guessed/negative/zero credits.

Sources:
- https://open.higgsfield.ai/pricing
- https://higgsfield.ai/blog/higgsfield-api
- https://open.higgsfield.ai/models/higgsfield/genjutsu/motion-transfer/v1.0/playground
- https://open.higgsfield.ai/models/minimax/hailuo-2.3/standard/text-to-video/playground

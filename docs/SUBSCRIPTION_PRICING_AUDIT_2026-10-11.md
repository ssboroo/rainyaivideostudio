# RAINY Video Studio — Credit Pricing & Monthly Subscriptions
**Audit date:** 2026-10-11 · **Scope:** RAVS Video API models only. Voice Studio has a separate payment/wallet system.

## Architecture and billing truths

- The external Higgsfield API uses **prepaid USD pay-as-you-go**. Higgsfield's creator website subscription is NOT transferable API inventory.
- RAVS converts the audited API quote to an **integer credit amount** with one canonical `quoteApiCredits` function used by Studio, REST, MCP, and the provider submission.
- Pricing is **per request/variant**, not a flat "1 video = X credits": output seconds, output pixel dimensions, model, audio mode, video input seconds, number of images, and actual provider token usage can change the underlying cost.
- **Prepaid manual renewal**: the customer pays through a new verified Wire payment for every month. There is no saved recurring card mandate, automatic charge, hidden negative wallet, or "unlimited" plan.
- Credits are reserved transactionally. Failed/canceled provider generations refund through the existing ledger. Expired subscription credits cannot be resurrected via refund.
- One confirmed paid intent creates exactly one credit grant and one immutable SubscriptionCycle. An idempotent status/webhook race cannot allocate double credits.
- Plan switch: paying for a new plan changes the visible monthly membership immediately; the old plan's unused credits retain THEIR ORIGINAL expiration date, and the new grant starts its own month. No prorated cash credit or implied extension.
- `CREDIT_PACKAGES_JSON` custom pricing fails closed if margin safety thresholds aren't met.
- The subscription database migration and legacy history backfill are append-only and do not change user wallet balances.

## Internal pricing assumptions (NOT live FX quotations)

| Control | Value | Meaning |
|:--|--:|:--|
| Planning FX | ₮3,900 per USD | Deliberately conservative budget scenario, not market spot |
| Quoted provider cost multiplier | 1.90x | 90% *cost markup*, NOT 90% profit margin |
| FX stress reserve | 10% | Conservative cushion over budget FX |
| Payment fee planning reserve | 4% | Estimated only; verify merchant invoice |
| Potential tax reserve | 10% | Planning only; confirm actual Mongolian tax rules |
| Hosting/ops reserve | 7% | Planning only |
| Contribution minimum | 27% | Scenario minimum; NOT guaranteed realized margin |
| Absolute pack price floor | ₮9.25 per credit | Protects scenarios if an admin edits packages |
| Cancellation/refund | Existing ledger | Credits refunded for failed generation when provider reports final status |

**Canonical RAVS credit quote:** `ceil(estimated_provider_cost_usd * 3900 * 1.90 / (100000/12000))`.
Actual customer MNT equivalent: `quoted_credits * subscription_pack_price_mnt / pack_credits`. All values computed server-side; marketing displays are approximations.

## Prepaid membership tiers

| Plan | Price MNT / calendar month | Credits | MNT / credit | Intended user |
|:--|--:|--:|--:|:--|
| Starter | 29,900 | 3,000 | 9.97 | Small trial |
| Creator | 69,900 | 7,400 | 9.45 | Social creators |
| Pro | 179,000 | 19,000 | 9.42 | Frequent content |
| Studio | 449,000 | 48,000 | 9.35 | Production teams |
| Agency | 899,000 | 95,000 | 9.46 | Agencies |

These plans grant **credit budgets, not fixed counts of videos**. Every verified video or image model spends from the same wallet. Expensive configurations run fewer times.

## Published Higgsfield API price examples

As of October 2026, the catalogue contains 78 documented external API model specifications, of which 70 have API parameter documentation marked verified. **This does not mean all 70 configurations have a fully auditable cost.** The admin endpoint `/api/admin/pricing-audit` classifies all exposed model variants as QUOTABLE, NEEDS_INPUT_OR_PRICE_REVIEW, or API_UNVERIFIED, with official source links.

| Variant/example | Higgsfield public list-price behavior | RAVS policy |
|:--|:--|:--|
| Kling 3.0 | Per generated second, separate std/pro/audio modes | Model ID and options must match a reviewed rate |
| Wan 3.0 | Per generated second, resolution-dependent | Quote by duration and resolution |
| Seedance 2.5 | Video tokens depend on image dimensions, fps, generation seconds, and video-reference seconds | Conservative output dimensions, refuse unknown video references |
| Genjutsu Motion / Restyle | Per *source* video second (round up), resolution-specific | Require server-signed proof tied to user + exact media URL; no arbitrary YouTube URL pricing |
| Soul 2 | Per image, different sizes | Per-image estimate × quantity |
| Marketing Studio Flare/Sunburst | Image + text input/output actual token metering | Not assumed fixed: review or hold if actual token charges can't be reserved/reconciled |
| Other newly added API models | Variable | Fail closed if unpriced until reviewed |

**Model-specific and authoritative sources:**
- https://open.higgsfield.ai/models/bytedance/seedance-2.5/video-edit/playground
- https://open.higgsfield.ai/models/bytedance/seedance-2.0/text-to-video/playground
- https://open.higgsfield.ai/models/marketing-studio/image/flare/playground
- https://open.higgsfield.ai/models/marketing-studio/image/playground
- https://higgsfield.ai/blog/generate-ai-videos-higgsfield-api
- https://open.higgsfield.ai/supercomputer

Catalog prices, promotional discounts, modes and durations change; revalidate rates on the exact model page before enabling a mode. Never infer a cheaper tier from generic provider marketing.

## Production release policy

1. Run `npx prisma migrate deploy` in Railway **pre-deploy** (service already has this configuration).
2. Test verified Wire one-time checkout and production webhook with an actual test purchase before declaring payments live. Currently Wire credentials are not configured on the RAVS Railway service.
3. Validate database safety: each payment = at most one credit grant and one immutable cycle; credit expiry and refunds do not change historical payment records.
4. Test API quote coverage, including resolutions, audio, image batch, video reference duration and tokens. Unpriced configurations are visibly unavailable.
5. Compare provider invoices with the quote and account for FX, taxes, infra overhead, retries and provider rounding. `RAVS_PRICING_HOLD=true` is the emergency stop for paid generation.
6. Publish clear monthly expiry, manual renewal, downgrade/upgrade and unused-credit behavior. Do not advertise auto-renew or unlimited until legally/technically implemented.

**For actual automatic subscriptions:** secure a payment provider that explicitly supports recurring mandates, customer consent, retry/dunning, cancellation and payment-method tokens. Wire hosted one-time checkout is NOT proof of recurring billing support.

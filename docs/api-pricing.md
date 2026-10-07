# API pricing policy — 2026-10-07

RAVS resells generations using its own Higgsfield API balance. Web subscription credits are unrelated to API dollar billing.

- Target markup: 120% of API list cost; multiplier 2.2. This is not a 120% net margin.
- Budget conversion: 3,700 MNT/USD, a conservative operational rate, not a live exchange-rate feed.
- Credit floor: 100,000 / 12,000 = 8.333333 MNT. Existing Starter/Creator/Pro package amounts stay unchanged. More expensive credits yield a larger markup.
- Credits = ceil(API USD estimate × 3,700 × 2.2 / credit floor).
- Promotional discounts are not assumed. Taxes, hosting and payment fees reduce net profit.
- Configuration-aware charging includes duration, resolution and image batch. Kling audio variants use the higher list rate.
- Seedance and Cinema tokens use upward-rounded 64-pixel aligned dimensions as a conservative estimate. Actual provider rounding may differ; compare completed-job invoices before enabling production.
- Source-video workflows are blocked until server-verified source duration is available. Marketing Studio token-metered images and unsupported price families are blocked rather than charged guessed flat costs.
- No subscription system is added by this change. Any later subscription allowance must obey the same minimum paid MNT/credit floor.
- Existing free/admin credits are promotional expenses and are outside paid-package margin guarantees.
- Review provider pricing and USD funding conversion regularly. This snapshot cannot guarantee profit after provider price or FX changes.

## Official evidence

Prices were read from https://open.higgsfield.ai/pricing and model playground pages under https://open.higgsfield.ai/models/ . Important list-rate evidence:

- Seedance 2.5: 0.0214 USD / 1,000 video tokens at 480p/720p; 0.0234 at 1080p.
- Seedance 2.0: 0.014 USD / 1,000 video tokens through 1080p; 0.008 at 4K.
- Cinema Studio 4.0: 0.0214 USD / 1,000 video tokens without source video.
- Wan Prime: 0.068 / 0.14 / 0.28 USD/second for 480p/720p/1080p.
- Wan 3.0: 0.05 / 0.10 / 0.20 USD/second.
- Soul 2: 0.0032 / 0.0057 USD/image for 720p/1080p.
- LTX Fast: 0.09 / 0.13 / 0.19 / 0.30 USD/second for 720p/1080p/2K/4K.

## Release

Run npm test, npm run check (with DATABASE_URL), and npm run build. Review CREDIT_PACKAGES_JSON: invalid, duplicate or below-floor packages now fail closed. Deploying this change affects credit deductions and temporarily disables unmetered workflows. No live database or Railway settings were changed while preparing the patch.

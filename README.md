# RAVS — Rainy AI Video Studio

**RAVS** is a production-oriented, Mongolian-first AI creative studio powered by the Higgsfield API.

## Included

- Next.js 16 App Router + TypeScript
- Premium responsive Mongolian Studio UI
- PostgreSQL + Prisma user, wallet, generation and payment data
- Server-side session cookies + scrypt password hashing
- Higgsfield async submit / status / cancel lifecycle
- Higgsfield signed uploads for image/video references
- Kling 3, Seedance 2.5, Wan 3 Prime, Motion Control, Cinema Studio, Genjutsu, Marketing Studio, Soul 2 and Ideogram registry
- Credit reservation + automatic refund on failed/NSFW/canceled generation
- **Wire.mn PaymentIntent → hosted checkout → signed webhook → wallet credit**
- Wire server-side payment status fallback and exact MNT amount/currency verification
- Admin operational stats
- Railway Docker deployment, healthcheck and pre-deploy migrations
- GitHub Actions security/type/schema/build/Docker verification

## Local development

```bash
cp .env.example .env.local
npm install
npx prisma migrate deploy
npm run dev
```

## Required production variables

```env
APP_URL=https://your-domain
DATABASE_URL=...
SESSION_SECRET=<32+ random chars>
HF_CREDENTIALS=KEY_ID:KEY_SECRET
# Provision an existing verified owner with scripts/grant-admin.mjs

WIRE_MN_API_URL=https://api.wire.mn/v1
WIRE_MN_API_KEY=sk_live_...
WIRE_MN_WEBHOOK_SECRET=whsec_...
# Live: active Wire operator IDs, or empty to let Wire use connected operators.
WIRE_MN_ALLOWED_OPERATORS=
WIRE_MN_WEBHOOK_ALLOWED_IPS=65.109.117.186
```

Wire webhook URL:

```
https://YOUR_DOMAIN/api/billing/wire/webhook
```

Wire signs webhooks using `WirePayment-Signature: t=<unix>,v1=<hex>`. RAVS verifies HMAC-SHA256 over `t + "." + rawBody` and rejects deliveries older/newer than 5 minutes. Only a verified successful PaymentIntent with the exact expected MNT amount can add credit. The hosted checkout redirect alone never marks a payment paid.

For test mode use a test API key and:

```env
WIRE_MN_ALLOWED_OPERATORS=sandbox
```

For a live key, do **not** leave `sandbox` in the operator list. Use the exact active Wire operator ID or leave the variable empty.

## Railway

1. **New Project → Deploy from GitHub** → `ssboroo/rainyaivideostudio`.
2. Add **PostgreSQL** in the same Railway project.
3. Set `DATABASE_URL=${{Postgres.DATABASE_URL}}`.
4. Add the required variables above.
5. Railway uses the root `Dockerfile` and `railway.json`.
6. Pre-deploy runs `npx prisma migrate deploy`.
7. Health check is `/api/health`.
8. Generate the public domain, set the exact HTTPS URL as `APP_URL`, then redeploy.
9. In Wire.mn dashboard configure the webhook URL above and copy the endpoint signing secret to `WIRE_MN_WEBHOOK_SECRET`.

## Security

- Never expose `HF_CREDENTIALS`, `WIRE_MN_API_KEY`, `WIRE_MN_WEBHOOK_SECRET` or `SESSION_SECRET` in the browser.
- Higgsfield file upload uses server-created signed upload URLs.
- Wire credit granting is idempotent and verified server-side.
- Production cookies are HttpOnly, Secure and SameSite=Lax.

## Notes

RAVS is an independent product and is not an official Higgsfield product.

## Монгол холболтын заавар

[Higgsfield API холбох, Railway variables, админ эрх, тест болон хязгаарлалтууд](docs/HIGGSFIELD_SETUP_MN.md). Public registration always creates USER; ADMIN_EMAILS no longer elevates signups.

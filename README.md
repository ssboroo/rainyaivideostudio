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
- QPay Merchant V2 invoice + callback verification
- Admin operational stats
- Railway Docker deployment, healthcheck and pre-deploy migrations
- GitHub Actions type/schema/build verification

## Local development

1. Copy env:
   ```bash
   cp .env.example .env.local
   ```
2. Start PostgreSQL and set `DATABASE_URL`.
3. Install and migrate:
   ```bash
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
ADMIN_EMAILS=admin@example.com
```

For QPay:
```env
QPAY_ENV=production
QPAY_CLIENT_ID=...
QPAY_CLIENT_SECRET=...
QPAY_INVOICE_CODE=...
QPAY_CALLBACK_SECRET=<random secret>
```

## Railway

1. **New Project → Deploy from GitHub** → `ssboroo/rainyaivideostudio`.
2. Add **PostgreSQL** in the same Railway project.
3. On the RAVS service, add a reference variable:
   `DATABASE_URL=${{Postgres.DATABASE_URL}}`
4. Add the required variables above.
5. Railway detects the root `Dockerfile` and `railway.json`.
6. Pre-deploy runs `npx prisma migrate deploy`.
7. Health check is `/api/health`.
8. Generate a Railway public domain, then set that exact URL as `APP_URL` and redeploy.

## Security

- Never expose `HF_CREDENTIALS`, QPay secrets or `SESSION_SECRET` in the browser.
- Higgsfield file upload uses server-created signed upload URLs.
- QPay callbacks are re-verified against QPay before wallet credits are issued.
- Production cookies are HttpOnly, Secure and SameSite=Lax.

## Notes

RAVS is an independent product and is not an official Higgsfield product.

# RAVS — Rainy AI Video Studio

RAVS is a Mongolian-first AI creative studio designed around Higgsfield-powered video, image and creative workflows.

## Vision

A premium, simple, fully Mongolian creative platform for AI Video, AI Image, Cinema, Motion Control, Genjutsu, Marketing Studio, Product Ads, AI Influencer and future Higgsfield capabilities.

## Included in the first commit

- Next.js 16 App Router + TypeScript
- Premium dark RAVS landing page
- Mongolian Studio workspace
- Model registry for Higgsfield-backed workflows
- Generation API adapter boundary
- Demo-safe mode when no API key is configured
- Responsive desktop/mobile UI
- `.env.example`

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment

```env
HF_API_KEY=
HIGGSFIELD_BASE_URL=https://api.higgsfield.ai
NEXT_PUBLIC_APP_NAME=RAVS
```

> Never expose the Higgsfield API key in the browser. All provider calls must go through server-side route handlers/adapters.

## Planned modules

1. Higgsfield model adapters (Video/Image/Workflows)
2. Generation polling + webhook persistence
3. Supabase Auth/PostgreSQL
4. QPay wallet & credit engine
5. Cloud storage for assets and outputs
6. Prompt enhancer for Mongolian prompts
7. Projects/history/remix
8. Templates/effects/presets
9. Admin dashboard + cost/margin controls

## Brand

**RAVS** = **Rainy AI Video Studio**

This project is an independent product and should not present itself as an official Higgsfield product.

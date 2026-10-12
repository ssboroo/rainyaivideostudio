# RAINY Create — Video + Voice production

Entry: `https://create.rainy.studio`, or `/create` on the existing Video service.

One authenticated customer submits a Mongolian brief and a 15/30/60-second format.
The director first creates a saved STORYBOARD draft with Mongolian visual descriptions, shot timings, narration and subtitle drafts. The customer reviews it and explicitly approves the exact plan before any price/payment step. Approval stores a hash of the full plan; checkout and worker execution reject a changed or missing plan. The director is not called again after approval. Storyboard generation only requires the director API, independently of payment/Voice readiness.

Approved narration uses scene-timed SRT input in the Voice worker. A server-owned quote
includes all video scenes, Voice TTS and MP4 assembly. Wire hosted checkout charges
one fixed MNT amount. Only an independently verified PAID intent makes the job
eligible for the existing persistent worker. A campaign purchase grants no wallet
credits: its provider budget is isolated from unrelated customer wallet activity.

The worker submits each quoted scene, polls completion, creates narration in Voice,
and asks Voice's existing FFmpeg worker to assemble a 720p MP4. Voice's merchant
account pays internal Voice compute credits; the customer pays only the campaign
invoice. Final files stay on Voice's persistent volume. An authenticated Video
proxy checks campaign ownership, then streams only that campaign's completed file.

## Production configuration

Keep `STUDIO_CAMPAIGNS_ENABLED=false` until a real paid end-to-end acceptance test.
Video service needs:

- `STUDIO_PUBLIC_ORIGIN=https://create.rainy.studio`
- `STUDIO_DIRECTOR_PROVIDER=gemini` (or gpt/claude), its API key and configured
  `RAINY_GEMINI_MODEL` / `RAINY_OPENAI_MODEL` / `RAINY_CLAUDE_MODEL`.
- `STUDIO_VIDEO_MODEL=kling-3-turbo` (reviewed text-to-video model).
- `STUDIO_VOICE_ORIGIN=https://voice.rainy.studio`.
- `STUDIO_VOICE_CLIENT_ID` and `STUDIO_VOICE_REFRESH_TOKEN`: authorized merchant
  Voice OAuth account with `voice:read voice:generate offline_access`. Keep secrets
  server-side. Tokens rotate under a Postgres row lock and are stored AES-GCM
  encrypted using SESSION_SECRET. Losing/changing SESSION_SECRET requires reconnect.
- `STUDIO_VOICE_ID`, `STUDIO_VOICE_MODEL=eleven_v4_turbo`.
- `STUDIO_VOICE_CREDIT_MNT`: reviewed retail rate for one internal Voice credit.
- `STUDIO_ASSEMBLY_CREDITS_PER_MIN`: same rate as Voice's
  `RAINY_MOVIE_ASSEMBLY_CREDITS_PER_MIN`.
- Existing HF credentials, live Wire API key/webhook secret and operator settings.

Voice must have merchant credit reserves, verified provider plan and TTS access.
Enable `RAINY_MOVIE_ENABLED` only after real HF completed-media host verification
and FFmpeg smoke test. Set `RAINY_MOVIE_MEDIA_HOSTS` to exact trusted CDN hosts.
The customer never needs the merchant Voice login or token.

Run Prisma migrations before this feature. Existing worker supervision runs the
campaign tick only when the feature flag is true. No extra worker service required.

## Failure handling and acceptance

A unique campaign payment binding and provider idempotency keys protect repeated
checkout clicks. Persist dispatch state BEFORE each paid provider POST. If a worker
crashes between provider acceptance and local persistence, the job moves to manual
review; it never automatically issues another paid request. A lease token fences
stale workers. Provider tariff increases beyond the quoted scene/assembly limit
also stop for review without automatically collecting more customer money.

Operational limitations: no automated cash refund, no automatic retry of uncertain
paid submissions, and no guaranteed face/brand consistency. Manual refunds must use
the original Wire invoice. Failed campaign provider consumption needs reconciliation.
This version does not burn subtitles or offer product-photo references. The director's
narration is shown before payment; draft quote creation may consume merchant LLM API
usage but never customer wallet credits. The server limits requests per account.

Validation in this change: production Next build and TypeScript pass; 174 Node tests pass (1 existing database test skipped); Voice OAuth/assembly tests pass. Live paid generation remains untested because production credentials are missing.

Before activation verify: two simultaneous checkout requests bind one invoice;
unpaid/failed/mismatched payments never start work; one paid 15-second campaign
runs HF → TTS → assembly → authenticated MP4 download; foreign user download fails;
OAuth refresh survives restart; ambiguous POST recovery does not repeat provider
charges; quote expiry rejects new checkout; failed paid work has a refund procedure.

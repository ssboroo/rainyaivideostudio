# RAINY Studio · гурван үе шатны техникийн хяналтын заавар (2026-10-12)

## 1. Higgsfield каталог ба үнэ

Одоогийн production main дээр Higgsfield endpoint-ийн жагсаалт болон USD list-rate нь кодын 2026-10-11 snapshot; API-аар шинэчлэгддэггүй. `/api/pricing/quote` болон generation server ижил баталгаажсан credit quote ашигладаг; мэдэгдэхгүй нэхэмжлэл хийхгүй.

Энэ өөрчлөлт `lib/higgsfield-live-feed.ts` нэмсэн. **Анхдагч тохиргоогоор унтраалттай**. Албан, account-specific, машины уншиж чадах feed-г Higgsfield өгсний дараа:

- `HF_CREDENTIALS` Railway-д зөвхөн server-side хадгална.
- `HIGGSFIELD_TARIFF_FEED_URL=https://api.higgsfield.ai/<албан_баталгаажсан_зам>` — замыг Higgsfield-ээс АЛБАН ёсоор авна; энд өгсөн placeholder-ийг URL гэж ашиглаж болохгүй.
- `HIGGSFIELD_LIVE_PRICING_ENABLED=true` — туршилтын аккаунт + баталгаажсан JSON schema + production smoke test амжилттай дараа л асаана.
- Feed JSON гэрээ: `{ "revision":"provider-revision", "tariffs":[{"modelId":"official/model/id","unit":"per_second","usdRate":0.30,"parameters":{"resolution":"720p","generate_audio":true}}] }`.
  Энэ бол **RAINY adapter-ийн шаарддаг формат**, Higgsfield яг энэ JSON-ийг буцаадаг гэж нотлоогүй. Шаардлагатай бол албан schema-д зориулсан adapter нэмнэ.
- Feed серверт 5 минут TTL-тай. Timeout, endpoint/schema алдаа, тодорхойгүй тариф/вариант үед төлбөртэй үүсгэлт хаагдана. Provider-ийн үнийг frontend рүү илгээхгүй.
- `GET /api/models`: local audited catalog, `liveCatalog` revision болон `upstreamUnreviewed` ID-ууд. Шинэ ID-г API дэмжинэ гэж автоматаар сурталчлахгүй; schema, entitlement, аудитаар шалгасны дараа `lib/models.ts` дотор оруулна.
- `POST /api/pricing/quote` нь төлбөргүй quote, generation дээр тариф дахин шалгадаг. Хэрэглэгч баталсан `maxCredits`-ээс хэтэрвэл дахин зөвшөөрөл авна.

Бүтэн автомат catalogue + tariffs-ийн гадаад хамаарал: Higgsfield-ийн баримтжуулсан account-specific machine-readable catalog API, entitlement, invoice reconciliation. Нотлогдоогүй HTML scraping болон сайтад зориулсан "unlimited" үнийг API үнэ гэж тооцохгүй.

## 2. RAINY Voice Studio холбоос

- Video `/director` → narration → `https://voice.rainy.studio/#rainy=<base64url>`.
- URL fragment нь browser дотор задлагдаж Voice редакторт орох тул request log-д бичвэр дамжихгүй.
- Voice дээр бүртгэл, боломжтой voice, ElevenLabs v4 TTS, Scribe v2 STT, Dubbing v2 болон MP4 mastering **тус тусын баталгаажсан** ажлын урсгалаар үргэлжилнэ.
- Voice wallet, Video wallet нь одоо ч тусдаа. Ямар ч дамжуулалт хэрэглэгчийн зөвшөөрөлгүйгээр кредит хасахгүй.
- Монгол Subtitle SRT нь AI Director-ийн **ноорог**, бодит STT/forced alignment-ийн timecode гэж үзэхгүй.
- Бүрэн нэг товчтой production orchestration, unified billing ledger, signed cross-site job transport, final media imports, media consent checks, rendering QA нь тусдаа gate шаарддаг. Үүнийг хийгдээгүй байхад “fully one-click” гэж сурталчлахгүй.

## 3. GPT / Claude / Gemini Agent

- `/director` UI болон `GET/POST /api/director` нэмэгдсэн.
- Server-only key, explicit LLM model, origin check, auth, 6 req/hour/process beta gate, prompt length/duration, strict scene JSON validation, draft SRT.
- `RAINY_DIRECTOR_ENABLED=true` нь админ туршилтын үндсэн flag; олон нийтэд нээх бол **LLM өөрийн зардлыг төлөх** metering/wallet, persistent distributed quota нэмсний дараа `RAINY_DIRECTOR_PUBLIC=true`.
- `OPENAI_API_KEY` + `RAINY_OPENAI_MODEL`, `ANTHROPIC_API_KEY` + `RAINY_CLAUDE_MODEL`, `GEMINI_API_KEY` + `RAINY_GEMINI_MODEL` — алинд нь credential байхгүй, тэр model disabled.
- Agent ямар ч Higgsfield эсвэл ElevenLabs төлбөртэй request өөрөө илгээхгүй; зураг, voice, видео бүрт хэрэглэгч тусдаа quote/confirmation өгнө.

## Туршилтын чанарын gate

1. GitHub CI: Prisma, TS typecheck, Node test, Next production build, Docker build; Voice repo Python+JS CI.
2. Railway variables нь secret value-ийг frontend/deploy log-д гаргахгүй байх.
3. 3 өөр provider тус бүр API JSON smoke test: тогтмол model entitlement, budget, timeout, rate limit, schema validation.
4. Provider feed ашиглаж байвал 2 удаагийн тарифын revision change → хоёр удаагийн quote → generation reprice; unknown tariff үед 0 debit.
5. Voice TTS, STT, Dubbing job бүр quoted wallet debit + artifact playback, Mongolian subtitle QA.
6. Алдаа, timeout, cancel, webhook replay, provider actual invoice тулгалт.
7. Бүх gate амжилттай хүртэл platform feature-ийг production-д нийтэд нээхгүй.

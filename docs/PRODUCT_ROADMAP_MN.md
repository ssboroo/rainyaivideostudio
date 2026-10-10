# RAINY Studio — өрсөлдөх давуу тал ба хүлээн авах шалгуур (2026-10-10)

## Архитектурын шийдвэр
- **RAINY Video (RAVS)**: Higgsfield видео/зураг, тусдаа Postgres кредит, OAuth MCP, вэб UI.
- **RAINY Voice**: ElevenLabs дуу/dubbing, тусдаа SQLite кредит, OAuth MCP, вэб UI.
- **AI orchestration**: ChatGPT/Claude хоёр custom MCP connector-ийг **тус тусад нь** холбож нэгдсэн ярианд ажиллана. Сайтын код, account, wallet, API key-г нэгтгэхгүй.
- MCP tool төлбөртэй API ажиллуулах бүрт *хэрэглэгчээс тусдаа зөвшөөрөл*, maxCredits, idempotencyKey шаардлагатай.

## Одоо кодд байгаа
1. Video MCP: моделийн каталог, guide, storyboard brief, нэг кадрын quote, **1–20 кадрын quote**, paid generation, status, account, cross-studio handoff.
2. Voice MCP: Монгол дууны жагсаалт, emotion/speed/SRT/glossary-тай quote/TTS, job status, last 20 jobs, wallet, OAuth grant revocation.
3. Төлбөрийн баталгаа: бүтэлгүй хүсэлт дахин давтагдахгүй; Voice шинэ MCP idempotency reservation ба кредит debit нэг DB transaction-д.
4. Видео + дууны **автомат mux, нэг MP4 export, lip-sync, нийтлэх** энэ шатанд **байхгүй**. Хуучин Voice веб UI-д video_voiceover upload байгаа боловч MCP-д шууд bridge байхгүй.

## P0 — Production баталгаажуулалт (ямар ч буултгүй)
- Хоёр MCP-ийн HTTPS OAuth Dynamic Client Registration, PKCE, resource audience, 401, token rotation, revocation-ыг бодит ChatGPT/Claude account-аар шалга.
- Төлбөртэй нэг тестийн өмнө хэрэглэгчийн зөвшөөрөл, provider хүчинтэй API quota, wallet reserve хэмжээг батал.
- 401/403, 402, provider timeout, double-click/retry, generation failed/NSFW/cancelled, refund recovery, application restart, database concurrency test.
- Voice /data Railway volume backup + restore drill, migration rollback, provider API downtime.
- Railway deploy terminal SUCCESS + /health 2xx + endpoint discovery test заавал.

## P1 — Нэг MP4 бэлэн экспорт
- Хэрэглэгч RAVS COMPLETED видео болон Voice DONE TTS job-ийг өөрөө сонгоно.
- **Cross-origin media handoff** нь тусдаа хугацаатай, нэг хэрэглэгч/нэг asset scope-той зөвшөөрөлтэй; серверүүд нэгнийхээ API key-г мэдэхгүй.
- Provider output-г авахдаа SSRF safe allowlist, HTTPS, DNS/IP block, redirect revalidation, video MIME/size/duration checks, timeout, malware/malicious file handling, queue; free-form URL fetch огт хийхгүй.
- FFmpeg mux worker, retry, credit accounting, idempotency, failure reporting; 9:16/16:9/1:1; SRT burn-in optional.
- Acceptance: нэг RAVS видео + нэг Voice audio → чанарын QA давсан 1 MP4, action давтахад хоёр удаа суутгахгүй, хийж дуусах хүртэл COMPLETED гэж харагдахгүй.

## P2 — Director AI (олон scene)
- 5–20 scene storyboard, shot prompts, asset references, кадр бүрийн тооцоо, хэрэглэгчийн төлөвлөгөөний зөвшөөрөл.
- Scene бүрийг өөрчлөх/дахин үүсгэх; үйлдвэрлэлийн түүх хадгалах.
- Character/Brand consistency **best-effort**; reference, logo OCR/QA, өнгө ба keyframe гэх мэт QA тайлан. 100% face lock гэж худал амлахгүй.

## P3 — Монгол бизнесийн рекламын үйлдвэр
- Монгол хэлээр чанартай voice-over, олон speaker, өөрчлөх боломжтой script, тайлбарласан дуудлагын толь, subtitle timing засвар.
- Video editor: crop, social safe-zones, music ducking, caption burned-in.
- Шинжилгээ: scene failure rate, 2xx/4xx/5xx, quote-to-complete, provider cost/unit, gross margin, user refund and support time.
- Бизнес: QPay/Wire бодит эргүүлэн шалгасан төлбөр, MNT багц, хэрэглэгчийн credit cap, Agency approval.

## P4 — B2B болон олон сувгийн үйлчилгээ
- Agency workspace: багийн role, project permission, spending limit, per-client brand kit, revision/approval log.
- Export integrations: Explicit OAuth authorizations to user-owned social accounts; publish only after approval.
- API/Webhook: signed callback, rotating secrets, 30-day retention defaults, encrypted asset/token handling.

## Хөгжүүлэлт ба маркетингийн дүрэм
- OpenAI / Claude / ElevenLabs / Higgsfield / Seedance логогоор албан ёсны түнш гэж тайлбарлаж болохгүй, зөвхөн бодит албан ёсны зөвшөөрөлтэй үед.
- Байгаа боломж ба хийхээр төлөвлөсөн боломжийг UI дээр тодорхой ялга.
- Automated workflow ≠ automatic production: нэгтгэсэн MP4 export хараахан байхгүй.
- Фото/хүний дууг клондох үед эрх, зөвшөөрөл, файл устгах сонголтыг баримтжуул.

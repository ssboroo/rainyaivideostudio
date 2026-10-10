# RAVS: ChatGPT / Claude MCP холболт

Remote Streamable HTTP endpoint: `https://rainyaivideostudio-production.up.railway.app/mcp`.
Хэрэглэгчийн заавар: `/integrations`.

## Серверийн тохиргоо

Одоо байгаа TypeScript, npm, Next.js, Prisma төслийг ашиглана. `@modelcontextprotocol/sdk` нь протоколыг боловсруулна. Railway deploy-оос өмнө `npx prisma migrate deploy` ажиллаж OAuth хүснэгтүүд болон үүсгэлтийн давтан хүсэлтийн unique key-г нэмнэ.

`APP_URL` нь сайтын бодит HTTPS origin байх ёстой. `SESSION_SECRET` нь одоо байгаа хамгаалагдсан серверийн secret. `HF_CREDENTIALS` нь сервер дээр runtime-д ачаалагдана. Нууц утга frontend, MCP tool result, GitHub болон чат руу гарахгүй.

## Claude

1. Customize → Connectors → + Add → Add custom connector.
2. Нэр RAVS; remote URL дээрх `/mcp` endpoint.
3. Authentication: Sign in now. OAuth client: **Register automatically**. Энэ сервер dynamic client registration дэмжинэ; published client identity metadata ашиглахгүй.
4. RAVS бүртгэлээр нэвтэрч зөвшөөрлийн хуудсан дээр эрхээ шалгаж зөвшөөр.
5. Чатад + → Connectors → RAVS идэвхжүүл.

Байгууллагын орчинд connector нэмэх эрх эзэмшигч/админд хязгаарлагдаж болно.
Албан заавар: https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp

## ChatGPT

Веб дээр тухайн төлөвлөгөө, workspace-д Developer mode / custom MCP app нээлттэй үед Settings → Apps → Create ашиглана. MCP URL-ээ өгч OAuth сонгоно. RAVS дээр нэвтэрч эрхээ зөвшөөрөөд tool discovery хийж аппыг нэмнэ. Бичих хэрэгслийн дэмжлэг төлөвлөгөөнөөс хамаарна.
Албан заавар: https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt

Scope тохируулдаг клиентэд:
- Унших: `ravs:read`
- Үүсгэлт ба удаан хугацааны холболт: `ravs:read ravs:generate offline_access`
- OAuth resource: endpoint-ийн бүтэн `/mcp` URL. Шинэ клиент authorization ба token request-д энэ resource indicator-ийг илгээнэ. Хуучин клиент параметрийг орхивол сервер зөвхөн энэ MCP хаягийг ашиглана; өөр, хоосон эсвэл давхар resource-ийг зөвшөөрөхгүй.

## Эрх ба хамгаалалт

OAuth authorization code + PKCE S256. Exact redirect URI. Код 2 минут хүчинтэй, нэг удаа ашиглагдана. Access token 1 цаг, optional refresh token 30 хоног; refresh ашиглахад хуучин хос хүчингүй болно. Өгөгдлийн санд токен/кодын SHA-256 hash хадгална. Grant нь user, client, resource, scope-той холбогдоно. `/integrations`-ээс grant цуцлахад түүний бүх токен хүчингүй болно.

Нэвтрэх cookie MCP authentication болж ашиглагдахгүй. Клиент Bearer token-оор өөрийн зөвшөөрсөн хэрэглэгчийн өгөгдөлд л хандана. Эхлүүлэх хүсэлтэд `confirmGeneration:true`, `maxCredits`, 16–128 тэмдэгттэй `idempotencyKey` шаардлагатай. Ижил үйлдлийн retry-д ижил key хэрэглэ; шинэ бүтээлд шинэ key. Энэ нь RAVS талын давтан төлбөр, давтан submission-ийг хориглоно. Provider Idempotency-Key header-ийн дэмжлэгт найдаж автоматаар generation POST давтахгүй.

## Контентын дараалал

1. `ravs_list_models` → загваруудыг зориулалтаар харьцуул.
2. `ravs_model_guide` → тухайн хувилбарын шаардлагатай материал, хугацаа, хэмжээ, API параметр.
3. `ravs_content_brief` → ажлын чиглэл. ChatGPT/Claude өөрөө Монгол санаа, storyboard, prompt, hook, caption, CTA, хуваарь боловсруулна.
4. `ravs_estimate` → бодит schema шалгаж кредит тооцоол. Энэ нь төлбөргүй.
5. Хэрэглэгч тодорхой зөвшөөрсний дараа `ravs_create_generation`.
6. `ravs_generation_status`-аар шалга. Зөвхөн COMPLETED болон медиа URL гарсан үед бэлэн гэж мэдээл. FAILED, NSFW, CANCELED нь амжилт биш.

Олон кадр эвлүүлэх, сошиалд нийтлэх хэрэгсэл энэ MCP-д байхгүй. Нийтлэх бичвэр/төлөвлөгөө бэлдэж, тус бүрийн медиа үүсгэнэ.

## Тодорхойгүй submission

Timeout/5xx нь provider хүсэлтийг хүлээн аваагүйг батлахгүй. Ийм үед автоматаар refund эсвэл шинэ submission хийхгүй. Өөрийн generation ID-г хадгал. Хүлээн авсан provider response-ийн ID-г хадгалах DB transient failure-д бичихийг дахин оролдоно. Сэргээгээгүй PENDING хүсэлт админд харагдана.

Админ `/admin` дээр **Тодорхойгүй илгээлтийг сэргээх** хэсэгт орж Console дээрх загвар, оролт, цагийг тулган бодит provider request ID-г холбоно. Үйлдэл зөвхөн одоо байгаа хүсэлтийн төлөвийг GET-ээр шалгана; шинэ үүсгэлт, шинэ төлбөр үүсгэхгүй. Console дээр хүсэлт байгаа эсэх тодорхойгүй бол шинэ хүсэлт илгээхгүй. Provider хүлээн аваагүй, төлбөртэй ажил эхлээгүйг баталгаажуулсан админ тусдаа баталгаажуулалтаар хүсэлтийг хааж кредитийг буцаах боломжтой. Failed/refund transient failure-ийг status check дахин оролдоно. Хэрэглэгчийн `/studio` эсвэл MCP status дараагийн polling хийхэд бэлэн үр дүн, баталгаажсан failure/refund lifecycle үргэлжилнэ.

## Шалгалт ба хязгаар

`npm test`, `DATABASE_URL=postgresql://localhost:5432/ravs npm run check`, `npm run build`, `npm run audit:prod`.
Mock тестүүд SDK initialize/list/call, read scope, explicit confirmation, own account, estimate, PKCE, code single-use, refresh rotation, revocation, audience болон credit lifecycle-ийг шалгана. Mock тест амжилттай байх нь бодит ChatGPT/Claude account installation эсвэл billable Higgsfield generation амжилтыг батлахгүй. Шинэ холболтыг хэрэглэгч өөрийн апп дотроос зөвшөөрч нэмнэ.

Эх сурвалж: https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization

## RAINY Voice-тай MCP workflow (2026-10-09)

- RAVS Video, RAINY Voice нь **тусдаа сайт, OAuth бүртгэл, кредит, API credential, өгөгдөлтэй** хэвээр.
- ChatGPT/Claude дээр хоёр MCP custom connector-ийг тус тусад нь нэмж зөвшөөр. Voice endpoint: `https://rainytts-production.up.railway.app/mcp` (Voice талд VOICE_MCP_ENABLED=true болж production deployment батлагдсаны дараа).
- RAVS `ravs_voice_workflow_plan` (read-only) ба `rainy_video_voice_campaign` prompt-оос эхэл.
- RAVS `ravs_estimate` ба Voice `rainy_voice_quote_tts` тус тусдаа тооцдог; зардлыг нийтлэг нэг wallet гэж үзэхгүй.
- Зөвшөөрөл авсан үед `ravs_create_generation` ба `rainy_voice_create_tts`-ийг тус тусад нь дуудна.
- Status-г тусдаа шалгаж, RAVS `COMPLETED`, Voice `done` болсны дараа л бэлэн гэж мэдээл.
- **Анхаар:** Эхний MCP workflow нь медиа файл автоматаар mux хийхгүй. Voice download URL нь нэвтэрсэн хэрэглэгчийн session шаарддаг. Нэг MP4 болгон экспортолсон гэж мэдэгдэж болохгүй.


## Олон кадрын тооцоолол — 2026-10-10

- `ravs_scene_batch_estimate`: 1–20 кадрын modelSlug, параметрийг тус бүр шалгаж, хүчинтэй бол нийт RAVS кредит гаргана. Төлбөртэй Higgsfield хүсэлт илгээхгүй.
- Нэг кадр буруу байвал `status: invalid`, `totalCredits: null` гэж буцаана. Нийт дүнг батлагдсан үнэ гэж бүү тайлбарла.
- Voice-ийн үнэд `rainy_voice_quote_tts` хэрэгслийг **тусад нь** хэрэглэ. Кадр тус бүрийн generation-д хүний тодорхой зөвшөөрөл шаардлагатай.

# RAVS — Higgsfield API холбох заавар

Шалгасан огноо: 2026-10-06. Албан эх сурвалж: https://docs.higgsfield.ai/docs/authentication , https://docs.higgsfield.ai/docs/concepts/requests , https://docs.higgsfield.ai/docs/concepts/file-uploads .

## 1. API эрхээ бэлдэх

https://console.higgsfield.ai дээр өөрийн бүртгэлээр орж API credential үүсгэнэ. API key ID болон secret гэсэн хоёр утгыг авна. Нууц утгыг чат, screenshot, GitHub эсвэл frontend кодод оруулахгүй. Console дээр API balance, боломжтой загвар болон зарцуулалтаа шалгана. Сайтын хэрэглэгчийн subscription нь API эрх, balance-тай адил гэж үзэхгүй; өөрийн Console-оос баталгаажуулна.

## 2. Railway-д тохируулах

Төсөл: https://railway.com/project/2e77e3b2-c98e-4011-8505-73ee93f162db

rainyaivideostudio → Variables хэсэгт дараах server-only утгыг нэмнэ:

```dotenv
HF_CREDENTIALS=YOUR_KEY_ID:YOUR_KEY_SECRET
HIGGSFIELD_BASE_URL=https://api.higgsfield.ai
```

Эсвэл `HF_CREDENTIALS`-ийн оронд `HF_API_KEY_ID`, `HF_API_KEY_SECRET` хоёр тусдаа variable ашиглаж болно. Хоёуланг нь өгсөн үед HF_CREDENTIALS давуу эрхтэй. Утгуудын эхэнд `Key ` гэж бичихгүй; код Authorization header-т үүнийг өөрөө нэмнэ. `NEXT_PUBLIC_` prefix ашиглахгүй. Save / Deploy хийж дуусгана. Одоо байгаа DATABASE_URL, SESSION_SECRET, APP_URL утгуудыг дарж өөрчлөх шаардлагагүй.

## 3. Холболтоо шалгах

Админ → Үйлчилгээний төлөв дээр түлхүүр тохируулагдсан эсэх харагдана. Энэ нь зөвхөн variable байгаа эсэхийг шалгана; түлхүүр хүчинтэй, balance хүрэлцээтэй эсвэл бүх model ажиллахыг батлахгүй.

Бүртгэлтэй хэрэглэгчээр Studio-д орж Soul 2 загвар, нэг зураг, богино prompt сонгон жинхэнэ тест үүсгэлт хийнэ. Энэ тест provider дээр төлбөртэй байж болно. Дараахыг баталгаажуулна: хүсэлт queued → in_progress → completed болж өөрчлөгдөх, зураг харагдах, татаж нээх, кредит нэг удаа хасагдах. Нэг queued хүсэлтийг цуцлах, нэг хүчингүй оролтод кредит хасагдахгүй байхыг тусдаа тест хийнэ.

## 4. RAVS доторх урсгал

1. Browser → `/api/generations` (нэвтэрсэн хэрэглэгч, загвар ба оролтын шалгалт).
2. PostgreSQL transaction → кредит нөөцлөх, хүсэлтийн түүх үүсгэх.
3. Сервер → `POST https://api.higgsfield.ai/{modelId}`, `Authorization: Key ID:SECRET`, `Idempotency-Key: generation.id`.
4. Provider request_id, status_url, cancel_url-ийг өгөгдлийн санд хадгална.
5. Studio → өөрийн `/api/generations/{id}`-ээр төлөв шалгана. Сервер provider-ийн буцаасан URL-ийг зөвшөөрөгдсөн origin дээр дуудаж, өөр host руу credential дамжуулахгүй.
6. completed үед image/video URL харуулна. failed / nsfw / canceled үед кредит буцаана. Provider дээр generation эхэлсэн бол цуцлах боломжгүй.

## 5. Жишиг зураг, видео байрлуулах

Файлыг `/api/uploads/sign` → Higgsfield presigned upload URL → PUT upload гэсэн дарааллаар байршуулна. Provider буцаасан upload_headers-ийг бүгдийг илгээнэ. API credential storage URL руу илгээгдэхгүй. RAVS UI: PNG, JPEG, WebP зураг болон MP4 видео. 200 MB-аас том файлыг UI хориглоно; сонгосон model үүнээс бага хэмжээ/хугацааны хязгаартай байж болно. Media public URL provider-д хүртээмжтэй байх шаардлагатай.

## 6. Алдаа оношлох

| Төлөв | Шалгах зүйл |
| --- | --- |
| 401 | KEY_ID:KEY_SECRET утга, илүүдэл зай, хүчингүй credential |
| 400 / 422 | Тухайн model-ийн schema, шаардлагатай prompt/зураг/видео, хэмжээ ба хугацаа |
| 404 / 423 / 503 | Console дээр model access болон ашиглах боломжтой endpoint |
| 429 | Account/model rate limit; давтамжаа бууруулах |
| Үүсгэлт удах | Хүсэлтийн provider status; browser түүх шинэчлэх |
| Цуцлахгүй | in_progress болсон үед цуцлах боломжгүй |
| Үр дүн нээгдэхгүй | Гадаад output URL-ийн хадгалалтын хугацаа, CDN болон browser холболт |

Output файлууд дор хаяж 7 хоног хадгалагдана гэж shared documentation-д заасан. Урт хугацаанд хадгалах бол өөрийн S3/R2 storage руу архивлах backend worker шаардлагатай. Одоогийн RAVS хүсэлтийн түүх, output URL-ийг хадгалдаг; media файлыг байнгын архив руу хуулдаггүй.

## 7. Админ эрх

Нээлттэй бүртгэл үргэлж USER үүсгэнэ. ADMIN_EMAILS-ээр public signup-д админ эрх автоматаар олгохгүй. Зөвхөн итгэлтэй operator, баталгаажуулсан эзэмшигчийн одоо байгаа дансыг production console дээр:

```sh
ADMIN_USER_EMAIL=verified-owner@example.com node scripts/grant-admin.mjs
```

Энэ команд байгаа хэрэглэгчийн role-ийг ADMIN болгоно. Админ имэйлийг эзэмшдэгийг operator тусад нь шалгах ёстой. Тухайн данс дахин нэвтэрнэ. `/admin` хуудас серверээр ADMIN шалгана; админ API мөн тусдаа эрх шалгана. USER болон guest-д админ холбоос харагдахгүй.

## Нээлтээс өмнө үлдсэн шаардлагууд

- Provider key / balance болон Wire.mn live key, webhook secret тохируулах.
- SMTP/transactional email provider-тай имэйл баталгаажуулалт, нууц үг сэргээх урсгал нэмэх. Эдгээр нь одоогоор хэрэгжээгүй; имэйл ownership батлагдсан гэж үзэж болохгүй.
- Өгөгдлийн сангийн backup / restore болон мониторингийг тохируулах.
- Олон replica ажиллуулахын өмнө auth limiter-ийг shared Redis/DB дээр шилжүүлэх. Одоогийн auth limiter нэг process-д хамаарна, restart үед шинэчлэгдэнэ.
- Signed session 30 хоног хүчинтэй. Logout browser cookie-г устгана; хулгайлагдсан token-ийг бүх төхөөрөмжөөс revoke хийх session registry одоогоор байхгүй.
- Provider submit timeout үед upstream хүсэлт хүлээн авсан эсэх тодорхойгүй байж болно. Idempotency key хадгалагдсан боловч автомат reconciliation worker одоогоор байхгүй; provider analytics болон RAVS ledger-ээр тулган шалгах.

## Албан SDK — Seedance 2.5 жишээ

Төсөл TypeScript + npm ашиглана. `@higgsfield/client@0.2.6`, `@next/env`, TypeScript ажиллуулах `tsx` суулгасан.

1. Өөрийн компьютер дээр төслийн `.env.local` файлыг редактороор нээнэ. `HF_CREDENTIALS=` талбарт `key-id:key-secret` утгыг зөвхөн локал оруулна. Түлхүүрийг чат, screenshot, git эсвэл log руу оруулахгүй.
2. `npm ci`, дараа нь `npm run hf:example` ажиллуулна. Энэ команд нэг төлбөртэй видео үүсгэлт илгээнэ.
3. `index.ts` нь `higgsfield.subscribe("bytedance/seedance-2.5/text-to-video", {input: ..., withPolling: true})` ашиглана. Prompt: `A cinematic scene at sunset`; 5 секунд; 720p; 16:9.
4. Зөвхөн `completed` бөгөөд хүчинтэй HTTPS `video.url` ирсэн үед URL хэвлэнэ. Алдаа, цуцлалт, moderation болон timeout-ыг амжилт гэж тайлагнахгүй; raw SDK exception, header, credential хэвлэхгүй.
5. Live веб дээр түлхүүрээ Railway Variables-д `HF_CREDENTIALS` нэрээр өөрөө нэмнэ. Энэ нь зөвхөн серверт ашиглагдана. `.env.local` git болон Docker build context-оос хасагдсан.

2026-10-06 шалгалт: жишээ командыг ажиллуулсан боловч түлхүүр тохируулаагүй учир `BLOCKED` гэж зогссон. Provider-д төлбөртэй хүсэлт илгээгээгүй, generated video URL аваагүй. SDK тохиргоо бодит үүсгэлтээр батлагдсан гэсэн дүгнэлт хийгээгүй.

### Вебийн хүсэлтийн урсгал

SDK `subscribe`-ийг `withPolling:false`-тай ашиглан request ID-г шууд database-д хадгална. Удаан generation дуусахыг HTTP route дээр хүлээхгүй. Түүхээс status URL-ыг poll хийж, үр дүнг хадгалан тоглуулж/татаж авна. Idempotency-Key нь generation ID; automatic submission retry унтраасан. Failed, moderated, canceled хүсэлтэд кредит буцаах одоогийн урсгал ажиллана.

`lib/hf-model-specs.ts` дахь параметрийн сан нь model-specific official API references-ээс бэлтгэсэн snapshot. Баримт уншигдсан нь тухайн API account бүх model-д эрхтэй гэсэн баталгаа биш. API баримт нээгдэхгүй эсвэл auth заавар зөрүүтэй model-уудыг хүсэлт илгээхээс өмнө блоклоно. `modelOptions` нийтлэг duration/prompt/reference тохиргоог дарж солихгүй. Кредитийг баталгаажсан duration-аас тооцно.

Албан эх сурвалжууд:
- https://docs.higgsfield.ai/docs/how-to/sdk
- https://console.higgsfield.ai/models/bytedance/seedance-2.5/text-to-video/api-reference
- https://open.higgsfield.ai/explore

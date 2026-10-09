import { GenerationServiceError } from "./generation-service";
import { boundedBody } from "./mcp-oauth";

type Dependencies = {
  user: () => Promise<{ id: string } | null>;
  create: (userId: string, raw: Record<string, unknown>, options: { idempotencyKey: string; maxCredits: number }) => Promise<unknown>;
  list: (userId: string) => Promise<{ generations: unknown[]; credits: number }>;
  get: (userId: string, id: string) => Promise<unknown>;
  cancel: (userId: string, id: string) => Promise<unknown>;
};
function failure(error: unknown) {
  if (error instanceof GenerationServiceError) return Response.json({ error: error.message }, { status: error.status });
  return Response.json({ error: "Хүсэлтийн төлөвийг авч чадсангүй. Шинэ үүсгэлт илгээхээс өмнө бүтээлийн түүхээ шалгана уу." }, { status: 503 });
}
const noStore = { "Cache-Control": "no-store" };
export function createGenerationHandlers(deps: Dependencies) {
  async function list() {
    try {
      const user = await deps.user();
      if (!user) return Response.json({ error: "Нэвтэрнэ үү." }, { status: 401 });
      const result = await deps.list(user.id);
      return Response.json({ ...result, user: { credits: result.credits } }, { headers: noStore });
    } catch (error) { return failure(error); }
  }
  async function create(request: Request) {
    try {
      const user = await deps.user();
      if (!user) return Response.json({ error: "Нэвтэрнэ үү." }, { status: 401 });
      let raw: unknown;
      try { raw = JSON.parse(await boundedBody(request, 65536)); }
      catch (error) {
        const oversized = !!error && typeof error === "object" && "status" in error && error.status === 413;
        return Response.json({ error: oversized ? "Хүсэлт хэт том байна." : "Хүсэлтийн мэдээлэл буруу байна." }, { status: oversized ? 413 : 400 });
      }
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return Response.json({ error: "Хүсэлтийн мэдээлэл буруу байна." }, { status: 400 });
      const { idempotencyKey, maxCredits, ...input } = raw as Record<string, unknown>;
      if (typeof idempotencyKey !== "string" || typeof maxCredits !== "number") return Response.json({ error: "Хуудсаа шинэчлээд кредитийн дээд хэмжээг зөвшөөрнө үү." }, { status: 400 });
      const result = await deps.create(user.id, input, { idempotencyKey, maxCredits });
      return Response.json(result, { status: 202, headers: noStore });
    } catch (error) { return failure(error); }
  }
  async function detail(id: string, cancel = false) {
    try {
      const user = await deps.user();
      if (!user) return Response.json({ error: "Нэвтэрнэ үү." }, { status: 401 });
      return Response.json(await (cancel ? deps.cancel : deps.get)(user.id, id), { headers: noStore });
    } catch (error) { return failure(error); }
  }
  return { list, create, detail };
}

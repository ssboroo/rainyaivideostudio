import { expireUserCredits } from "@/lib/credit-expiry";
import { createHash } from "node:crypto";
import { Generation, GenerationStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getModel, estimateCredits, buildProviderInput } from "@/lib/models";
import { reserveCredits, refundGeneration, markTerminalAndRefund } from "@/lib/credits";
import { submitGeneration, getGenerationStatus, cancelGeneration, mapProviderStatus } from "@/lib/higgsfield";
import { mediaFrom } from "@/lib/generation-media";

export class GenerationServiceError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = "GenerationServiceError"; }
}
const terminal = new Set<GenerationStatus>(["COMPLETED", "FAILED", "NSFW", "CANCELED"]);
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => `${JSON.stringify(key)}:${canonical(val)}`).join(",")}}`;
  return JSON.stringify(value) ?? "null";
}
export function publicGeneration(g: Generation) {
  const media = g.status === "COMPLETED" ? mediaFrom(g.output) : null;
  return { id: g.id, modelSlug: g.modelSlug, prompt: g.prompt, kind: g.kind, status: g.status, costCredits: g.costCredits,
    refunded: g.refunded, createdAt: g.createdAt.toISOString(), completedAt: g.completedAt?.toISOString() ?? null,
    media: media?.url.startsWith("https://") ? media : null,
    warning: g.status === "PENDING" && !g.providerRequestId && (Date.now() - g.createdAt.getTime() > 120000 || !!g.error) ? "Хүсэлтийн хүлээн авалт тодорхойгүй байна. Давтан үүсгэхгүйгээр админаар төлөвийг нягтлуулна уу." : undefined,
    message: g.status === "FAILED" ? "Үүсгэлт амжилтгүй болсон." : g.status === "NSFW" ? "Агуулгын шалгалтаар хүсэлт зогссон." : g.status === "CANCELED" ? "Хүсэлт цуцлагдсан." : undefined };
}
const defaults = { db, env, expireUserCredits, reserveCredits, refundGeneration, markTerminalAndRefund, submitGeneration, getGenerationStatus, cancelGeneration };
export function createGenerationService(deps: typeof defaults = defaults) {
  async function retryLocal<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt < 3; attempt++) {
      try { return await operation(); } catch (error) { lastError = error; }
    }
    throw lastError;
  }
  async function account(userId: string) {
    await deps.expireUserCredits(userId);
    const user = await deps.db.user.findUnique({ where: { id: userId }, select: { id: true, name: true, credits: true } });
    if (!user) throw new GenerationServiceError("Бүртгэл олдсонгүй.", 401);
    return user;
  }
  async function own(userId: string, id: string) {
    const generation = await deps.db.generation.findFirst({ where: { id, userId } });
    if (!generation) throw new GenerationServiceError("Үүсгэлт олдсонгүй.", 404);
    return generation;
  }
  async function create(userId: string, raw: Record<string, unknown>, options: { idempotencyKey: string; maxCredits: number }) {
    if (!/^[A-Za-z0-9_.:-]{8,128}$/.test(options.idempotencyKey)) throw new GenerationServiceError("Давтан хүсэлтийн ID 8–128 тэмдэгт байна.", 400);
    if (!Number.isSafeInteger(options.maxCredits) || options.maxCredits < 0) throw new GenerationServiceError("Зөвшөөрсөн кредитийн дээд хэмжээг бүхэл тоогоор оруулна уу.", 400);
    const model = getModel(typeof raw.modelSlug === "string" ? raw.modelSlug : "");
    if (!model) throw new GenerationServiceError("Загвар олдсонгүй.", 404);
    let input: Record<string, unknown>;
    try { input = buildProviderInput(model, raw); } catch (error) { throw new GenerationServiceError(error instanceof Error ? error.message : "Оролт буруу байна.", 400); }
    let cost: number;
    try { cost = estimateCredits(model, Number(input.duration), input); }
    catch (error) { throw new GenerationServiceError(error instanceof Error ? error.message : "Үнэ баталгаажуулж байна.", 503); }
    if (cost > options.maxCredits) throw new GenerationServiceError(`Энэ үүсгэлт ${cost} кредит шаардлагатай. Дээд хэмжээг дахин зөвшөөрнө үү.`, 409);
    const externalRequestKey = createHash("sha256").update(JSON.stringify([userId, options.idempotencyKey])).digest("hex");
    async function existing() {
      const row = await deps.db.generation.findFirst({ where: { userId, externalRequestKey } });
      if (!row) return null;
      if (row.modelSlug !== model!.slug || canonical(row.input) !== canonical(input)) throw new GenerationServiceError("Энэ давтан хүсэлтийн ID өөр оролтод ашиглагдсан байна.", 409);
      return { generation: publicGeneration(row), credits: (await account(userId)).credits, reused: true };
    }
    const replay = await existing();
    if (replay) return replay;
    if (!/^[^:\s]+:[^:\s]+$/.test(deps.env.higgsfieldCredentials())) throw new GenerationServiceError("Үүсгэх үйлчилгээ түр бэлтгэгдэж байна.", 503);
    const recent = await deps.db.generation.count({ where: { userId, createdAt: { gte: new Date(Date.now() - 60000) } } });
    if (recent >= deps.env.generationRateLimit()) throw new GenerationServiceError("Хэт олон хүсэлт. 1 минутын дараа оролдоно уу.", 429);
    let generation: Generation;
    try {
      generation = await deps.reserveCredits(userId, cost, { externalRequestKey, modelSlug: model.slug, modelId: model.modelId, kind: model.kind,
        prompt: typeof raw.prompt === "string" ? raw.prompt.trim().slice(0, 6000) : "", input: input as Prisma.InputJsonValue, status: "PENDING", costCredits: cost });
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "P2002") { const replay = await existing(); if (replay) return replay; }
      if (error instanceof Error && error.message.includes("Credit")) throw new GenerationServiceError("Кредит хүрэлцэхгүй байна.", 402);
      throw new GenerationServiceError("Хүсэлт бүртгэж чадсангүй.", 503);
    }
    let provider: Record<string, unknown>;
    try {
      provider = await deps.submitGeneration(model.modelId, input, generation.id);
    } catch (error) {
      const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 0;
      const definitiveRejection = status >= 400 && status < 500 && status !== 408 && status !== 425;
      if (!definitiveRejection) {
        await deps.db.generation.update({ where: { id: generation.id }, data: { error: { message: "Хүлээн авалт тодорхойгүй. Админ нягтлах шаардлагатай." } } }).catch(() => null);
        throw new GenerationServiceError("Хүсэлтийн хүлээн авалт тодорхойгүй байна. Кредит хадгалагдсан; шинэ хүсэлт бүү үүсгээрэй. Админаар нягтлуулна уу.", 503);
      }
      try {
        await retryLocal(() => deps.db.generation.update({ where: { id: generation.id }, data: { status: "FAILED", error: { message: "Үүсгэх хүсэлт татгалзагдсан." }, completedAt: new Date() } }));
        await retryLocal(() => deps.refundGeneration(generation.id, "submit_rejected"));
      } catch {
        throw new GenerationServiceError("Үйлчилгээ хүсэлтийг татгалзсан боловч кредитийн буцаалт түр хүлээгдэж байна. Энэ хүсэлтийн төлөвийг дахин шалгах эсвэл админд хандана уу.", 503);
      }
      throw new GenerationServiceError("Үйлчилгээ хүсэлтийг татгалзсан. Кредит буцаагдсан.", 502);
    }
    if (typeof provider.request_id !== "string" || !provider.request_id) {
      await deps.db.generation.update({ where: { id: generation.id }, data: { error: { message: "Үйлчилгээ хүсэлтийн ID буцаасангүй. Админ нягтлах шаардлагатай." } } }).catch(() => null);
      throw new GenerationServiceError("Үйлчилгээ хүсэлтийн ID буцаасангүй. Давтан үүсгэхгүйгээр админаар нягтлуулна уу.", 503);
    }
    let persisted = false;
    // Retry only the local persistence. Provider submission must never be repeated here.
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        generation = await deps.db.generation.update({ where: { id: generation.id }, data: { providerRequestId: provider.request_id,
          providerStatusUrl: typeof provider.status_url === "string" ? provider.status_url : null,
          providerCancelUrl: typeof provider.cancel_url === "string" ? provider.cancel_url : null, status: "SUBMITTED" } });
        persisted = true;
        break;
      } catch { /* A transient database error may recover on the next local attempt. */ }
    }
    if (!persisted) throw new GenerationServiceError("Үйлчилгээ хүсэлтийг хүлээн авсан боловч төлөв хадгалагдсангүй. Энэ ID-гаар админаар нягтлуулна уу; шинэ хүсэлт бүү үүсгээрэй.", 503);
    return { generation: publicGeneration(generation), credits: (await account(userId)).credits, reused: false };
  }
  async function get(userId: string, id: string) {
    let generation = await own(userId, id);
    if (terminal.has(generation.status) && generation.status !== "COMPLETED" && !generation.refunded) {
      try { generation = (await retryLocal(() => deps.refundGeneration(generation.id, "terminal_recovery"))) ?? generation; }
      catch { return { generation: publicGeneration(generation), credits: (await account(userId)).credits, warning: "Кредитийн буцаалт түр хүлээгдэж байна. Дахин шалгах эсвэл админд хандана уу." }; }
    }
    if (!terminal.has(generation.status) && generation.providerRequestId) {
      let provider;
      try { provider = await deps.getGenerationStatus(generation.providerRequestId, generation.providerStatusUrl); }
      catch { return { generation: publicGeneration(generation), credits: (await account(userId)).credits, warning: "Үүсгэх үйлчилгээний төлөвийг түр авч чадсангүй. Дахин шалгана уу." }; }
      const status = mapProviderStatus(provider.status);
      if (terminal.has(status)) {
        generation = await deps.markTerminalAndRefund(generation.id, status, provider, status === "COMPLETED" ? undefined : { message: "Үүсгэлт амжилтгүй дууссан." });
      } else {
        await deps.db.generation.updateMany({ where: { id: generation.id, userId, status: { notIn: [...terminal] } }, data: { status, output: provider as Prisma.InputJsonValue } });
        generation = await own(userId, generation.id);
      }
    }
    return { generation: publicGeneration(generation), credits: (await account(userId)).credits };
  }
  async function cancel(userId: string, id: string) {
    let generation = await own(userId, id);
    if (terminal.has(generation.status)) return { generation: publicGeneration(generation), credits: (await account(userId)).credits };
    if (generation.status === "PROCESSING" || generation.status === "PENDING" || !generation.providerRequestId) throw new GenerationServiceError("Хүсэлт илгээгдэж эсвэл үүсгэгдэж байгаа тул цуцлах боломжгүй байна.", 409);
    try { await deps.cancelGeneration(generation.providerRequestId, generation.providerCancelUrl); }
    catch { throw new GenerationServiceError("Үйлчилгээ цуцлалтыг баталгаажуулсангүй. Төлөвийг дахин шалгана уу.", 502); }
    // A 202 acknowledges the cancellation request; a terminal status settles credits.
    const result = await get(userId, id);
    return { ...result, warning: terminal.has(result.generation.status) ? result.warning : "Цуцлах хүсэлт илгээгдсэн. Эцсийн төлөв баталгаажтал кредит нөөцлөгдсөн хэвээр байна." };
  }
  async function list(userId: string) { const rows = await deps.db.generation.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 }); return { generations: rows.map(publicGeneration), credits: (await account(userId)).credits }; }
  return { create, get, cancel, list, account };
}
const service = createGenerationService();
export const createUserGeneration = service.create;
export const getUserGeneration = service.get;
export const cancelUserGeneration = service.cancel;
export const listUserGenerations = service.list;
export const getUserAccount = service.account;

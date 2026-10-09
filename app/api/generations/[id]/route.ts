import { requireUser } from "@/lib/http";
import { createGenerationHandlers } from "@/lib/generation-http";
import { createUserGeneration, listUserGenerations, getUserGeneration, cancelUserGeneration } from "@/lib/generation-service";
export const dynamic = "force-dynamic";
const handlers = createGenerationHandlers({ user: requireUser, create: createUserGeneration, list: listUserGenerations, get: getUserGeneration, cancel: cancelUserGeneration });
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Context) { return handlers.detail((await params).id); }
export async function DELETE(_: Request, { params }: Context) { return handlers.detail((await params).id, true); }

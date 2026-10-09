import { requireUser } from "@/lib/http";
import { createGenerationHandlers } from "@/lib/generation-http";
import { createUserGeneration, listUserGenerations, getUserGeneration, cancelUserGeneration } from "@/lib/generation-service";
export const dynamic = "force-dynamic";
const handlers = createGenerationHandlers({ user: requireUser, create: createUserGeneration, list: listUserGenerations, get: getUserGeneration, cancel: cancelUserGeneration });
export const GET = handlers.list;
export const POST = handlers.create;

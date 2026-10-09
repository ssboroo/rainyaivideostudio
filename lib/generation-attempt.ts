type Storage = Pick<globalThis.Storage, "getItem" | "setItem" | "removeItem">;
export type GenerationAttempt = { fingerprint: string; key: string };
export async function generationAttempt(userId: string, input: string, previous: GenerationAttempt | null, storage?: Storage): Promise<GenerationAttempt> {
  // Persist only a digest and request ID, never prompts, media URLs, or credentials.
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  const fingerprint = Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, "0")).join("");
  let saved = previous;
  if (!saved && storage) {
    try { saved = JSON.parse(storage.getItem(`ravs-attempt:${userId}`) || "null"); } catch { /* Private browsing may disable storage. */ }
  }
  const attempt = saved?.fingerprint === fingerprint && typeof saved.key === "string" && /^[A-Za-z0-9_.:-]{8,128}$/.test(saved.key) ? saved : { fingerprint, key: crypto.randomUUID() };
  try { storage?.setItem(`ravs-attempt:${userId}`, JSON.stringify(attempt)); } catch { /* In-memory retries still use the same ID. */ }
  return attempt;
}
export function clearGenerationAttempt(userId: string, storage?: Storage) {
  try { storage?.removeItem(`ravs-attempt:${userId}`); } catch { /* Storage may be unavailable. */ }
}

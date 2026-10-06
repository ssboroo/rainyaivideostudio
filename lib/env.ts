function intEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}
export const env = {
  appUrl: () => (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, ""),
  sessionSecret: () => process.env.SESSION_SECRET || "",
  welcomeCredits: () => intEnv("WELCOME_CREDITS", 100),
  generationRateLimit: () => intEnv("GENERATION_RATE_LIMIT_PER_MINUTE", 6),
  higgsfieldBaseUrl: () => (process.env.HIGGSFIELD_BASE_URL || "https://api.higgsfield.ai").replace(/\/$/, ""),
  higgsfieldCredentials: () => process.env.HF_CREDENTIALS?.trim() || (process.env.HF_API_KEY_ID && process.env.HF_API_KEY_SECRET ? `${process.env.HF_API_KEY_ID.trim()}:${process.env.HF_API_KEY_SECRET.trim()}` : ""),
  wireApiUrl: () => (process.env.WIRE_MN_API_URL || "https://api.wire.mn/v1").replace(/\/$/, ""),
  wireApiKey: () => (process.env.WIRE_MN_API_KEY || "").trim(),
  wireWebhookSecret: () => (process.env.WIRE_MN_WEBHOOK_SECRET || "").trim(),
  wireAllowedOperators: () => (process.env.WIRE_MN_ALLOWED_OPERATORS || "").split(",").map(v => v.trim()).filter(Boolean),
  wireWebhookAllowedIps: () => (process.env.WIRE_MN_WEBHOOK_ALLOWED_IPS || "").split(",").map(v => v.trim()).filter(Boolean)
};
export function assertRuntimeConfig() {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (env.sessionSecret().length < 32) missing.push("SESSION_SECRET(>=32 chars)");
  return missing;
}

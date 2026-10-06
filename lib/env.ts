function intEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}
export const env = {
  appUrl: () => (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, ""),
  sessionSecret: () => process.env.SESSION_SECRET || "",
  adminEmails: () => (process.env.ADMIN_EMAILS || "").split(",").map(v => v.trim().toLowerCase()).filter(Boolean),
  welcomeCredits: () => intEnv("WELCOME_CREDITS", 100),
  generationRateLimit: () => intEnv("GENERATION_RATE_LIMIT_PER_MINUTE", 6),
  higgsfieldBaseUrl: () => (process.env.HIGGSFIELD_BASE_URL || "https://api.higgsfield.ai").replace(/\/$/, ""),
  higgsfieldCredentials: () => process.env.HF_CREDENTIALS || "",
  qpayEnv: () => (process.env.QPAY_ENV || "sandbox").toLowerCase(),
  qpayClientId: () => process.env.QPAY_CLIENT_ID || "",
  qpayClientSecret: () => process.env.QPAY_CLIENT_SECRET || "",
  qpayInvoiceCode: () => process.env.QPAY_INVOICE_CODE || "",
  qpayCallbackSecret: () => process.env.QPAY_CALLBACK_SECRET || ""
};
export function assertRuntimeConfig() {
  const missing: string[] = [];
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (env.sessionSecret().length < 32) missing.push("SESSION_SECRET(>=32 chars)");
  return missing;
}

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { consumeAuthLimit } from "@/lib/auth-security";
export const MCP_SCOPES = ["ravs:read", "ravs:generate", "offline_access"] as const;
export const mcpResourceUrl = () => `${env.appUrl()}/mcp`;
export const tokenHash = (value: string) => createHash("sha256").update(value).digest("hex");
export const pkceChallenge = (value: string) => createHash("sha256").update(value).digest("base64url");
const fresh = () => randomBytes(32).toString("base64url");
export class OAuthError extends Error { constructor(public error: string, public status = 400) { super(error); } }
export function parseScopes(value: string) {
  const scopes = [...new Set(value.split(/\s+/).filter(Boolean))];
  if (!scopes.includes("ravs:read") || scopes.some(s => !(MCP_SCOPES as readonly string[]).includes(s))) throw new OAuthError("invalid_scope");
  return scopes;
}
export function validRedirect(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 2048) return false;
  try { const u = new URL(value); return !u.username && !u.password && !u.hash && (u.protocol === "https:" || (u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname))); } catch { return false; }
}
export function oauthMetadata() { const base = env.appUrl(); return { issuer: base, authorization_endpoint: `${base}/oauth/authorize`, token_endpoint: `${base}/oauth/token`, registration_endpoint: `${base}/oauth/register`, revocation_endpoint: `${base}/oauth/revoke`, response_types_supported: ["code"], grant_types_supported: ["authorization_code", "refresh_token"], token_endpoint_auth_methods_supported: ["none"], code_challenge_methods_supported: ["S256"], scopes_supported: MCP_SCOPES }; }
export function protectedResourceMetadata() { return { resource: mcpResourceUrl(), authorization_servers: [env.appUrl()], scopes_supported: MCP_SCOPES, bearer_methods_supported: ["header"], resource_name: "RAVS Монгол бүтээлч студи" }; }
export function oauthResponse(value: unknown, status = 200) { return Response.json(value, {status, headers: {"Cache-Control":"no-store", "Pragma":"no-cache", "Access-Control-Allow-Origin":"*"}}); }
export function oauthFailure(error: unknown) { return oauthResponse({error: error instanceof OAuthError ? error.error : "server_error"}, error instanceof OAuthError ? error.status : 503); }
export function checkOAuthLimit(req: Request, operation: string, limit = 60) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!consumeAuthLimit(`oauth:${operation}:${ip}`, limit, 60_000).allowed) throw new OAuthError("temporarily_unavailable", 429);
}
export async function boundedBody(req: Request, limit = 16384) {
  if (Number(req.headers.get("content-length")) > limit) throw new OAuthError("invalid_request", 413);
  if (!req.body) return "";
  const reader = req.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const {value, done} = await reader.read(); if (done) break; size += value.byteLength; if (size > limit) { await reader.cancel(); throw new OAuthError("invalid_request", 413); } chunks.push(value); } } finally {reader.releaseLock();}
  return Buffer.concat(chunks).toString("utf8");
}
export type AuthorizationRequest = {clientId:string; redirectUri:string; challenge:string; resource:string; scope:string; state:string};
export async function validateAuthorization(p: URLSearchParams): Promise<AuthorizationRequest & {clientName:string}> {
  if (p.get("response_type") !== "code" || p.get("code_challenge_method") !== "S256" || !/^[A-Za-z0-9_-]{43}$/.test(p.get("code_challenge") || "")) throw new OAuthError("invalid_request");
  const clientId = p.get("client_id") || "", redirectUri = p.get("redirect_uri") || "";
  const client = await db.oAuthClient.findUnique({where:{id:clientId}});
  if (!client || !Array.isArray(client.redirectUris) || !client.redirectUris.includes(redirectUri)) throw new OAuthError("invalid_client");
  if (p.get("resource") !== mcpResourceUrl()) throw new OAuthError("invalid_target");
  const scope = parseScopes(p.get("scope") || "ravs:read").join(" "); const state = p.get("state") || "";
  if (state.length > 2048) throw new OAuthError("invalid_request");
  return {clientId, clientName:client.name, redirectUri, challenge:p.get("code_challenge")!, resource:mcpResourceUrl(), scope, state};
}
export function signConsent(userId: string, request: AuthorizationRequest, now = Date.now()) {
  if (env.sessionSecret().length < 32) throw new OAuthError("server_error", 503);
  const payload = Buffer.from(JSON.stringify({userId,request,expires:now+600_000})).toString("base64url");
  return `${payload}.${createHmac("sha256", env.sessionSecret()).update(payload).digest("base64url")}`;
}
export function readConsent(value: string, userId: string, now = Date.now()): AuthorizationRequest {
  if (value.length > 12000 || env.sessionSecret().length < 32) throw new OAuthError("invalid_request");
  const [payload,signature,...extra] = value.split("."); if (!payload || !signature || extra.length) throw new OAuthError("invalid_request");
  const expected = createHmac("sha256", env.sessionSecret()).update(payload).digest(); const received = Buffer.from(signature,"base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected,received)) throw new OAuthError("invalid_request");
  let parsed; try {parsed=JSON.parse(Buffer.from(payload,"base64url").toString("utf8"));} catch {throw new OAuthError("invalid_request");}
  if (parsed.userId !== userId || !Number.isFinite(parsed.expires) || parsed.expires <= now) throw new OAuthError("invalid_request");
  return parsed.request;
}
export async function issueCode(userId: string, request: AuthorizationRequest) {
  const code = fresh(); await db.oAuthCode.create({data:{codeHash:tokenHash(code),userId,clientId:request.clientId,redirectUri:request.redirectUri,challenge:request.challenge,resource:request.resource,scope:request.scope,expiresAt:new Date(Date.now()+120_000)}}); return code;
}
function tokenValues(scope: string) {const access = fresh(), refresh = scope.split(" ").includes("offline_access") ? fresh() : null; return {access,refresh,data:{accessHash:tokenHash(access),refreshHash:refresh?tokenHash(refresh):null,accessExpiresAt:new Date(Date.now()+3600_000),refreshExpiresAt:refresh?new Date(Date.now()+30*86400_000):null}};}
export async function exchangeToken(p: URLSearchParams) {
  const clientId = p.get("client_id") || ""; if (p.get("resource") !== mcpResourceUrl()) throw new OAuthError("invalid_target");
  if (p.get("grant_type") === "authorization_code") {
    const verifier = p.get("code_verifier") || ""; if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier)) throw new OAuthError("invalid_grant");
    const codeHash = tokenHash(p.get("code") || "");
    return db.$transaction(async tx => {
      const code = await tx.oAuthCode.findUnique({where:{codeHash}});
      if (!code || code.usedAt || code.expiresAt <= new Date() || code.clientId !== clientId || code.redirectUri !== p.get("redirect_uri") || code.resource !== mcpResourceUrl() || code.challenge !== pkceChallenge(verifier)) throw new OAuthError("invalid_grant");
      const consumed = await tx.oAuthCode.updateMany({where:{id:code.id,usedAt:null,expiresAt:{gt:new Date()}},data:{usedAt:new Date()}}); if (consumed.count !== 1) throw new OAuthError("invalid_grant");
      const grant = await tx.oAuthGrant.create({data:{userId:code.userId,clientId,resource:code.resource,scope:code.scope}}); const values = tokenValues(code.scope);
      await tx.oAuthToken.create({data:{...values.data,grantId:grant.id}});
      return {access_token:values.access,token_type:"Bearer",expires_in:3600,...(values.refresh?{refresh_token:values.refresh}:{}),scope:code.scope};
    });
  }
  if (p.get("grant_type") === "refresh_token") {
    return db.$transaction(async tx => {
      const token = await tx.oAuthToken.findUnique({where:{refreshHash:tokenHash(p.get("refresh_token") || "")},include:{grant:true}});
      if (!token || token.revokedAt || !token.refreshExpiresAt || token.refreshExpiresAt <= new Date() || token.grant.revokedAt || token.grant.clientId !== clientId || token.grant.resource !== mcpResourceUrl()) throw new OAuthError("invalid_grant");
      if (p.has("scope") && parseScopes(p.get("scope")!).join(" ") !== token.grant.scope) throw new OAuthError("invalid_scope");
      const consumed = await tx.oAuthToken.updateMany({where:{id:token.id,revokedAt:null},data:{revokedAt:new Date()}}); if (consumed.count !== 1) throw new OAuthError("invalid_grant");
      const values = tokenValues(token.grant.scope); await tx.oAuthToken.create({data:{...values.data,grantId:token.grantId}});
      return {access_token:values.access,token_type:"Bearer",expires_in:3600,refresh_token:values.refresh,scope:token.grant.scope};
    });
  }
  throw new OAuthError("unsupported_grant_type");
}
export async function authenticateMcp(req: Request): Promise<{userId:string;scopes:string[];grantId:string}|null> {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(req.headers.get("authorization") || ""); if (!match) return null;
  const token = await db.oAuthToken.findUnique({where:{accessHash:tokenHash(match[1])},include:{grant:true}});
  if (!token || token.revokedAt || token.accessExpiresAt <= new Date() || token.grant.revokedAt || token.grant.resource !== mcpResourceUrl()) return null;
  return {userId:token.grant.userId,scopes:token.grant.scope.split(" "),grantId:token.grantId};
}
export async function revokeToken(token: string, clientId: string) {
  const hash = tokenHash(token); const row = await db.oAuthToken.findFirst({where:{OR:[{accessHash:hash},{refreshHash:hash}],grant:{clientId}}});
  if (row) await db.oAuthGrant.updateMany({where:{id:row.grantId,clientId,revokedAt:null},data:{revokedAt:new Date()}});
}

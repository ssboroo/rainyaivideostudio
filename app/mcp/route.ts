import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createRavsMcpServer } from '@/lib/mcp-server';
import { authenticateMcp, mcpResourceUrl } from '@/lib/mcp-oauth';
import * as services from '@/lib/generation-service';
import { consumeAuthLimit } from '@/lib/auth-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const allowedOrigins = new Set(['https://chatgpt.com', 'https://claude.ai']);
export async function POST(request: Request) {
  const resource = new URL(mcpResourceUrl());
  const origin = request.headers.get('origin');
  if (origin && origin !== resource.origin && !allowedOrigins.has(origin)) return Response.json({ error: 'Origin зөвшөөрөгдөөгүй.' }, { status: 403 });
  // Railway may forward a private Host; the public URL is fixed by APP_URL, never inferred for discovery.
  let identity;
  try { identity = await authenticateMcp(request); } catch { return Response.json({ error: 'Холболтын үйлчилгээ түр боломжгүй.' }, { status: 503 }); }
  if (!identity) return unauthorized(resource.origin);
  const limit = consumeAuthLimit(`mcp:${identity.userId}`, 90, 60000);
  if (!limit.allowed) return Response.json({ error: 'Хэт олон хүсэлт.' }, { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } });
  const server = createRavsMcpServer(identity, services);
  const transport = new WebStandardStreamableHTTPServerTransport({ enableJsonResponse: true, maxRequestBodySize: 128 * 1024 });
  try {
    await server.connect(transport);
    const response = await transport.handleRequest(request);
    // JSON mode settles the tool before handleRequest resolves. Buffer the small response then release per-request state.
    const body = await response.arrayBuffer();
    const headers = new Headers(response.headers); headers.set('Cache-Control', 'no-store');
    return new Response(body.byteLength ? body : null, { status: response.status, headers });
  } catch { return Response.json({ error: 'MCP хүсэлтийг гүйцэтгэж чадсангүй.' }, { status: 500 }); }
  finally { await server.close().catch(() => undefined); }
}
function unauthorized(origin: string) {
  return Response.json({ error: 'RAVS бүртгэлээр OAuth зөвшөөрөл өгнө үү.' }, { status: 401, headers: { 'WWW-Authenticate': `Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource/mcp"`, 'Cache-Control': 'no-store' } });
}
export async function GET(request: Request) {
  const origin = request.headers.get('origin'); const publicOrigin = new URL(mcpResourceUrl()).origin;
  if (origin && origin !== publicOrigin && !allowedOrigins.has(origin)) return new Response(null, { status: 403 });
  try { if (!await authenticateMcp(request)) return unauthorized(publicOrigin); } catch { return new Response(null, { status: 503 }); }
  return new Response(null, { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
}
export async function DELETE(request: Request) { return GET(request); }

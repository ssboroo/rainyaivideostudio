import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function readAttr(tag: string, name: string) {
  const expression = new RegExp(name + "=[\\\"']([^\\\"']+)[\\\"']", "i");
  return tag.match(expression)?.[1] || null;
}

function metaValue(html: string, wanted: string) {
  const tags = html.match(/<meta\s+[^>]*>/gi) || [];
  for (const tag of tags) {
    const key = readAttr(tag, "property") || readAttr(tag, "name");
    if (key === wanted) return decodeValue(readAttr(tag, "content"));
  }
  return null;
}

function decodeValue(value: string | null) {
  if (!value) return null;
  return value
    .replace(/&amp;/g, "&")
    .replace(/\\u0026/g, "&")
    .replace(/\\u002F/g, "/")
    .replace(/\\\//g, "/");
}

function safeHttps(value: string | null) {
  const decoded = decodeValue(value);
  if (!decoded) return null;
  try {
    const parsed = new URL(decoded);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function firstEmbeddedVideo(html: string) {
  const directTag =
    html.match(/<video[^>]+src=["']([^"']+)["']/i)?.[1] ||
    html.match(/<source[^>]+src=["']([^"']+)["']/i)?.[1];
  const direct = safeHttps(directTag || null);
  if (direct) return direct;

  const normalized = html.replace(/\\u002F/g, "/").replace(/\\\//g, "/").replace(/\\u0026/g, "&");
  const encoded = normalized.match(/https:\/\/[^"'<>\s]+?\.(?:mp4|webm)(?:\?[^"'<>\s]*)?/i)?.[0] || null;
  return safeHttps(encoded);
}

export async function GET(req: Request) {
  const source = new URL(req.url).searchParams.get("url");
  if (!source) return NextResponse.json({ error: "url required" }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(source);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }

  if (
    parsed.protocol !== "https:" ||
    (parsed.hostname !== "higgsfield.ai" && !parsed.hostname.endsWith(".higgsfield.ai"))
  ) {
    return NextResponse.json({ error: "source not allowed" }, { status: 403 });
  }

  try {
    const response = await fetch(parsed.toString(), {
      headers: { "user-agent": "Mozilla/5.0 (compatible; RAVS-CommunityPreview/2.0)" },
      cache: "force-cache",
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return NextResponse.json({ source: parsed.toString() });

    const html = await response.text();
    const video = safeHttps(
      metaValue(html, "og:video:secure_url") ||
      metaValue(html, "og:video") ||
      metaValue(html, "twitter:player:stream")
    ) || firstEmbeddedVideo(html);
    const image = safeHttps(metaValue(html, "og:image:secure_url") || metaValue(html, "og:image"));

    return NextResponse.json(
      {
        source: parsed.toString(),
        video,
        image,
        title: metaValue(html, "og:title"),
        description: metaValue(html, "og:description"),
      },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=21600" } },
    );
  } catch {
    return NextResponse.json({ source: parsed.toString(), video: null, image: null });
  }
}

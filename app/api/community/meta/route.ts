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
    if (key === wanted) return (readAttr(tag, "content") || "").replace(/&amp;/g, "&") || null;
  }
  return null;
}

function safeMedia(value: string | null) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
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
      headers: { "user-agent": "Mozilla/5.0 (compatible; RAVS-CommunityPreview/1.0)" },
      cache: "force-cache",
    });
    if (!response.ok) return NextResponse.json({ source: parsed.toString() });

    const html = await response.text();
    const video = safeMedia(metaValue(html, "og:video:secure_url") || metaValue(html, "og:video"));
    const image = safeMedia(metaValue(html, "og:image:secure_url") || metaValue(html, "og:image"));
    const title = metaValue(html, "og:title");
    const description = metaValue(html, "og:description");

    return NextResponse.json(
      { source: parsed.toString(), video, image, title, description },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
    );
  } catch {
    return NextResponse.json({ source: parsed.toString() });
  }
}

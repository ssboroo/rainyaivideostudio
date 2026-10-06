import { NextResponse } from "next/server";

const MODEL_ENDPOINTS: Record<string, string> = {
  "kling-3": "/kling-video/v3.0/std/text-to-video",
  "wan-3-prime": "/alibaba/wan-3.0/text-to-video",
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.prompt) return NextResponse.json({ error: "prompt шаардлагатай" }, { status: 400 });

  const apiKey = process.env.HF_API_KEY;
  const base = process.env.HIGGSFIELD_BASE_URL ?? "https://api.higgsfield.ai";
  if (!apiKey) {
    return NextResponse.json({
      request_id: `demo_${Date.now()}`,
      status: "demo",
      note: "HF_API_KEY тохируулаагүй тул demo response буцаалаа."
    });
  }

  const endpoint = MODEL_ENDPOINTS[body.model];
  if (!endpoint) {
    return NextResponse.json({ error: "Энэ model adapter дараагийн commit-д холбогдоно.", model: body.model }, { status: 501 });
  }

  const providerResponse = await fetch(`${base}${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: body.prompt,
      duration: body.duration ?? 10,
      aspect_ratio: body.aspect_ratio ?? "9:16",
      resolution: body.resolution ?? "1080p",
      generate_audio: body.generate_audio ?? true,
    }),
  });

  const data = await providerResponse.json().catch(() => ({}));
  if (!providerResponse.ok) {
    return NextResponse.json({ error: "Higgsfield API алдаа", provider: data }, { status: providerResponse.status });
  }

  return NextResponse.json(data);
}

import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json({ request_id: id, status: id.startsWith("demo_") ? "completed" : "queued" });
}

import { NextResponse, type NextRequest } from "next/server";
import { isSameOriginMutation } from "@/lib/auth-security";
export function proxy(req: NextRequest) {
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.nextUrl.pathname !== "/api/billing/wire/webhook" && !isSameOriginMutation(req, process.env.APP_URL)) {
    return NextResponse.json({ error: "Зөвшөөрөгдөөгүй эх сурвалж." }, { status: 403 });
  }
  return NextResponse.next();
}
export const config = { matcher: "/api/:path*" };

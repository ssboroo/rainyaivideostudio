import { NextResponse, type NextRequest } from "next/server";
import { isSameOriginMutation } from "@/lib/auth-security";
export function proxy(req: NextRequest) {
  const campaignOrigin=process.env.STUDIO_PUBLIC_ORIGIN||"https://create.rainy.studio";
  if(req.nextUrl.pathname==="/"&&req.headers.get("host")===new URL(campaignOrigin).host){
    return NextResponse.rewrite(new URL("/create",req.url));
  }
  const requestOrigin=req.headers.get("origin");
  const publicUrl=requestOrigin===campaignOrigin?campaignOrigin:process.env.APP_URL;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.nextUrl.pathname !== "/api/billing/wire/webhook" && !isSameOriginMutation(req, publicUrl)) {
    return NextResponse.json({ error: "Зөвшөөрөгдөөгүй эх сурвалж." }, { status: 403 });
  }
  return NextResponse.next();
}
export const config = { matcher: ["/", "/api/:path*"] };

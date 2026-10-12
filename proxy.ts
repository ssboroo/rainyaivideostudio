import { NextResponse, type NextRequest } from "next/server";
import {createSiteAllowed,createSiteTarget} from "@/lib/create-site-routing";
import { isSameOriginMutation } from "@/lib/auth-security";
export function proxy(req: NextRequest) {
  const standalone=process.env.STUDIO_ONLY==="true";
  if(standalone&&!createSiteAllowed(req.nextUrl.pathname))return NextResponse.json({error:"Хуудас олдсонгүй."},{status:404});
  const campaignOrigin=process.env.STUDIO_PUBLIC_ORIGIN||"https://create.rainy.studio";
  const requestOrigin=req.headers.get("origin");
  const previewOrigin=process.env.RAILWAY_PUBLIC_DOMAIN?"https://"+process.env.RAILWAY_PUBLIC_DOMAIN:"";
  const publicUrl=requestOrigin===campaignOrigin?campaignOrigin:requestOrigin===previewOrigin?previewOrigin:process.env.APP_URL;
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.nextUrl.pathname !== "/api/billing/wire/webhook" && !isSameOriginMutation(req, publicUrl)) {
    return NextResponse.json({ error: "Зөвшөөрөгдөөгүй эх сурвалж." }, { status: 403 });
  }
  const upstream=createSiteTarget(req.headers.get("host"),req.nextUrl.pathname,req.nextUrl.search,standalone,campaignOrigin,process.env.STUDIO_STANDALONE_URL);
  if(upstream)return NextResponse.rewrite(upstream);
  if(req.nextUrl.pathname==="/"&&(standalone||req.headers.get("host")===new URL(campaignOrigin).host))return NextResponse.rewrite(new URL("/create",req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/:path*"] };

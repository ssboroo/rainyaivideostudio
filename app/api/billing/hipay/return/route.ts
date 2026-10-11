import { NextResponse } from "next/server";
import { env } from "@/lib/env";
/** Provider browser return is never proof of payment. UI must poll owned status. */
function back(req:Request){
  const url=new URL(req.url),app=new URL(env.appUrl());
  const id=url.searchParams.get("paymentId");
  const dest=new URL("/billing",app.origin);
  if(id&&/^[A-Za-z0-9_-]{8,128}$/.test(id)){
    dest.searchParams.set("payment","hipay");
    dest.searchParams.set("paymentId",id);
  }
  return NextResponse.redirect(dest,303);
}
export async function GET(req:Request){return back(req);}
export async function POST(req:Request){return back(req);}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser,jsonError } from "@/lib/http";
import { getCreditPackage } from "@/lib/billing";
import { env } from "@/lib/env";
import { createHipayInvoice,hipayCheckoutUrl,hipayEnabled,HipayError } from "@/lib/hipay";

export async function POST(req:Request) {
  const user=await requireUser();if(!user)return jsonError("Нэвтэрнэ үү.",401);
  if(!hipayEnabled())return jsonError("Visa / Mastercard merchant тохиргоо хараахан нээгдээгүй.",503);
  try {
    const body=await req.json();
    const pack=getCreditPackage(String(body.packageId||""));
    if(!pack)return jsonError("Багц олдсонгүй.",404);
    const app=new URL(env.appUrl());
    if(process.env.NODE_ENV==="production"&&app.protocol!=="https:")return jsonError("HTTPS шаардлагатай.",503);
    const payment=await db.payment.create({data:{
      userId:user.id,provider:"hipay",packageId:pack.id,
      amountMnt:pack.priceMnt,credits:pack.credits,validityMonths:pack.validityMonths
    }});
    const callback=new URL("/api/billing/hipay/return",app.origin);
    callback.searchParams.set("paymentId",payment.id);
    const webhook=new URL("/api/billing/hipay/webhook",app.origin);
    const checkoutId=await createHipayInvoice({
      amountMnt:payment.amountMnt,callbackUrl:callback.toString(),webhookUrl:webhook.toString()
    });
    await db.payment.update({where:{id:payment.id},data:{invoiceId:checkoutId}});
    return NextResponse.json({paymentId:payment.id,payUrl:hipayCheckoutUrl(checkoutId,user.email)});
  }catch(e) {
    if(e instanceof HipayError)return jsonError(e.message,e.status===400?400:503);
    return jsonError("HiPay нэхэмжлэл үүсгэж чадсангүй. Төлбөр хийгдээгүй.",503);
  }
}

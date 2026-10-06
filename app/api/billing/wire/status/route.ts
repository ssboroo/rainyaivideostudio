import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser,jsonError } from "@/lib/http";
import { mapIntentStatus,retrievePaymentIntent } from "@/lib/wire";
import { confirmWirePayment,markWirePaymentState,paymentMatches,checkoutUrlFromProviderData } from "@/lib/wire-payment";
export const dynamic="force-dynamic";
export async function GET(req:Request){
  const user=await requireUser();if(!user)return jsonError("Нэвтэрнэ үү.",401);
  const paymentId=new URL(req.url).searchParams.get("paymentId");if(!paymentId)return jsonError("paymentId шаардлагатай.");
  const payment=await db.payment.findFirst({where:{id:paymentId,userId:user.id,provider:"wire"}});
  if(!payment)return jsonError("Төлбөр олдсонгүй.",404);
  if(payment.status==="PAID")return NextResponse.json({status:"PAID",credits:user.credits});
  if(!payment.invoiceId)return NextResponse.json({status:payment.status,payUrl:checkoutUrlFromProviderData(payment.providerData)});
  try{
    const intent=await retrievePaymentIntent(payment.invoiceId);
    if(!paymentMatches(intent,payment))return jsonError("Төлбөрийн дүн эсвэл валют зөрж байна.",502);
    const mapped=mapIntentStatus(intent.status);
    if(mapped==="PAID")await confirmWirePayment(payment.id,intent);
    else if(mapped==="FAILED"||mapped==="CANCELED")await markWirePaymentState(payment.id,mapped);
    const fresh=await db.user.findUnique({where:{id:user.id},select:{credits:true}});
    return NextResponse.json({status:mapped,credits:fresh?.credits??user.credits,payUrl:checkoutUrlFromProviderData(payment.providerData)});
  }catch(e){return jsonError("Төлбөрийн төлөв шалгаж чадсангүй. Түр хүлээгээд дахин шалгана уу.",503)}
}

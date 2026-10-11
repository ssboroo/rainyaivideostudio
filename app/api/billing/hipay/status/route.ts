import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser,jsonError } from "@/lib/http";
import { verifyHipayInvoice,verifiedHipayState } from "@/lib/hipay";
import { confirmHipayPayment } from "@/lib/hipay-payment";
export const dynamic="force-dynamic";
export async function GET(req:Request) {
  const user=await requireUser();if(!user)return jsonError("Нэвтэрнэ үү.",401);
  const id=new URL(req.url).searchParams.get("paymentId");
  if(!id)return jsonError("paymentId шаардлагатай.",400);
  const p=await db.payment.findFirst({where:{id,userId:user.id,provider:"hipay"}});
  if(!p)return jsonError("Төлбөр олдсонгүй.",404);
  if(p.status==="PAID") {
    const fresh=await db.user.findUnique({where:{id:user.id},select:{credits:true}});
    return NextResponse.json({status:"PAID",credits:fresh?.credits??user.credits});
  }
  if(!p.invoiceId)return NextResponse.json({status:"PENDING"});
  try {
    const verified=await verifyHipayInvoice(p.invoiceId);
    const status=verifiedHipayState(verified,p.amountMnt);
    if(status==="PAID")await confirmHipayPayment(p.id,verified);
    if(status==="CANCELED")await db.payment.updateMany({where:{id:p.id,status:"PENDING"},data:{status:"CANCELED"}});
    const fresh=await db.user.findUnique({where:{id:user.id},select:{credits:true}});
    return NextResponse.json({status,credits:fresh?.credits??user.credits});
  }catch {return jsonError("HiPay төлбөрийг баталгаажуулж чадсангүй. Дахин шалгана уу.",503);}
}

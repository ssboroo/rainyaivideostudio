import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyHipayInvoice,verifiedHipayState } from "@/lib/hipay";
import { confirmHipayPayment } from "@/lib/hipay-payment";
export const dynamic="force-dynamic";
/** HiPay sends an unsigned GET notification. Never trust callback claims;
 * retrieve the invoice with our server-side merchant secret before settlement. */
export async function GET(req:Request) {
  const url=new URL(req.url),checkoutId=url.searchParams.get("checkoutId");
  if(!checkoutId||!(/^[A-Za-z0-9_-]{5,48}$/.test(checkoutId)))return NextResponse.json({ok:false},{status:400});
  const payment=await db.payment.findUnique({where:{invoiceId:checkoutId}});
  if(!payment||payment.provider!=="hipay")return NextResponse.json({ok:true,ignored:true});
  if(payment.status==="PAID")return NextResponse.json({ok:true});
  try {
    const verified=await verifyHipayInvoice(checkoutId);
    const state=verifiedHipayState(verified,payment.amountMnt);
    const notifiedTransaction=url.searchParams.get("paymentId");
    if(state==="PAID"){
      if(notifiedTransaction&&notifiedTransaction!==verified.paymentId)
        return NextResponse.json({ok:false},{status:409});
      await confirmHipayPayment(payment.id,verified);
    }
    return NextResponse.json({ok:true,state});
  }catch{return NextResponse.json({ok:false},{status:503});}
}

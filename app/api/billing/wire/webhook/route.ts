import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapIntentStatus,retrievePaymentIntent,verifyWebhookSignature,webhookSourceAllowed } from "@/lib/wire";
import { confirmWirePayment,markWirePaymentState,paymentMatches } from "@/lib/wire-payment";

export async function GET(){return NextResponse.json({ok:true,service:"RAVS Wire webhook",ts:Date.now()})}
export async function POST(req:Request){
  if(!webhookSourceAllowed(req))return NextResponse.json({error:"source_not_allowed"},{status:403});
  const raw=await req.text();const signature=req.headers.get("wirepayment-signature")||"";
  if(!verifyWebhookSignature(raw,signature))return NextResponse.json({error:"invalid_signature"},{status:401});
  try{
    const body=JSON.parse(raw) as Record<string,unknown>;
    const eventType=String(body.type||body.event_type||"").toLowerCase();
    if(eventType==="endpoint.verification")return NextResponse.json({ok:true,verified:true});
    if(!["payment_intent.succeeded","payment_intent.failed","payment_intent.canceled","payment_intent.expired"].includes(eventType))return NextResponse.json({ok:true,ignored:true});
    const envelope=(body.data||body.object||body) as Record<string,unknown>;
    const data=(typeof envelope.object==="object"&&envelope.object!==null?envelope.object:envelope) as Record<string,unknown>;
    const intentId=String(data.id||data.payment_intent||body.payment_intent_id||"");
    const transactionId=String(data.transaction_id||(data.latest_transaction as Record<string,unknown>|undefined)?.id||"")||undefined;
    if(!intentId)return NextResponse.json({error:"payment_intent id missing"},{status:400});
    const payment=await db.payment.findFirst({where:{provider:"wire",invoiceId:intentId}});
    if(!payment)return NextResponse.json({ok:true,ignored:true});
    const mapped=mapIntentStatus(String(data.status||eventType.slice("payment_intent.".length)));
    if(mapped==="PAID"&&payment.status!=="PAID"){
      const intent=await retrievePaymentIntent(intentId);
      if(mapIntentStatus(intent.status)!=="PAID"||!paymentMatches(intent,payment))return NextResponse.json({error:"payment_verification_failed"},{status:409});
      await confirmWirePayment(payment.id,intent,transactionId);
    }else if(mapped==="FAILED"||mapped==="CANCELED"){
      await markWirePaymentState(payment.id,mapped);
    }
    return NextResponse.json({ok:true});
  }catch(e){
    console.error("Wire webhook handler error",e instanceof Error?e.message:"unknown");
    return NextResponse.json({error:"webhook_handler_failed"},{status:500});
  }
}

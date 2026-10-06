import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser,jsonError } from "@/lib/http";
import { getCreditPackage } from "@/lib/billing";
import { env } from "@/lib/env";
import { createCheckoutSession,createPaymentIntent,mapIntentStatus,retrievePaymentIntent,WireApiError } from "@/lib/wire";
import { checkoutUrlFromProviderData,confirmWirePayment,markWirePaymentState,paymentMatches } from "@/lib/wire-payment";

export async function POST(req:Request){
  const user=await requireUser();if(!user)return jsonError("Нэвтэрнэ үү.",401);
  try{
    const body=await req.json();const pack=getCreditPackage(String(body.packageId||""));
    if(!pack)return jsonError("Багц олдсонгүй.",404);
    const recentSince=new Date(Date.now()-30*60*1000);
    let payment=await db.payment.findFirst({
      where:{userId:user.id,provider:"wire",packageId:pack.id,status:"PENDING",createdAt:{gte:recentSince}},
      orderBy:{createdAt:"desc"}
    });
    if(!payment)payment=await db.payment.create({data:{userId:user.id,provider:"wire",packageId:pack.id,amountMnt:pack.priceMnt,credits:pack.credits}});
    if(payment.amountMnt!==pack.priceMnt||payment.credits!==pack.credits){
      await markWirePaymentState(payment.id,"CANCELED");
      payment=await db.payment.create({data:{userId:user.id,provider:"wire",packageId:pack.id,amountMnt:pack.priceMnt,credits:pack.credits}});
    }

    let intentId=payment.invoiceId;
    if(intentId){
      const current=await retrievePaymentIntent(intentId);
      if(!paymentMatches(current,payment))return jsonError("Wire төлбөрийн дүн эсвэл валют зөрж байна.",409);
      const mapped=mapIntentStatus(current.status);
      if(mapped==="PAID"){
        await confirmWirePayment(payment.id,current);
        return NextResponse.json({paymentId:payment.id,paid:true});
      }
      if(mapped==="FAILED"||mapped==="CANCELED"){
        await markWirePaymentState(payment.id,mapped);
        payment=await db.payment.create({data:{userId:user.id,provider:"wire",packageId:pack.id,amountMnt:pack.priceMnt,credits:pack.credits}});
        intentId=null;
      }else{
        const cached=checkoutUrlFromProviderData(payment.providerData);
        if(cached)return NextResponse.json({paymentId:payment.id,payUrl:cached,paymentIntentId:intentId});
      }
    }

    if(!intentId){
      const intent=await createPaymentIntent({paymentId:payment.id,amount:payment.amountMnt,description:`RAVS ${pack.name} credit package`});
      intentId=intent.id;
      payment=await db.payment.update({where:{id:payment.id},data:{invoiceId:intent.id,providerData:{paymentIntentStatus:intent.status} as Prisma.InputJsonValue}});
    }

    const appUrl=new URL(env.appUrl());
    if(process.env.NODE_ENV==="production"&&appUrl.protocol!=="https:")return jsonError("APP_URL HTTPS байх шаардлагатай.",503);
    const success=new URL("/billing",appUrl.origin);
    success.searchParams.set("payment","success");success.searchParams.set("paymentId",payment.id);
    const session=await createCheckoutSession({paymentIntentId:intentId,paymentId:payment.id,successUrl:success.toString()});
    await db.payment.update({where:{id:payment.id},data:{providerData:{...(payment.providerData&&typeof payment.providerData==="object"&&!Array.isArray(payment.providerData)?payment.providerData as object:{}),checkoutSessionId:session.id,checkoutUrl:session.url} as Prisma.InputJsonValue}});
    return NextResponse.json({paymentId:payment.id,payUrl:session.url,paymentIntentId:intentId});
  }catch(e){
    if(e instanceof WireApiError){
      const configCodes=["operator_configuration","operator_unknown","connector_required","settlement_account_required","dan_verification_required","operator_not_allowed","checkout_url_invalid"];
      const message=e.status===401||configCodes.includes(e.code||"")?"Wire.mn төлбөрийн тохиргоог шалгах шаардлагатай.":e.message;
      return NextResponse.json({error:message,code:e.code,requestId:e.requestId},{status:e.status===409?409:e.status===429?429:503});
    }
    if(e instanceof Error&&["TimeoutError","AbortError"].includes(e.name))return jsonError("Wire.mn хариу удаж байна. Түр хүлээгээд дахин оролдоно уу.",504);
    return jsonError(e instanceof Error?e.message:"Wire.mn төлбөр үүсгэж чадсангүй.",500);
  }
}

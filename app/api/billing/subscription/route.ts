import {NextResponse} from "next/server";
import {requireUser,jsonError} from "@/lib/http";
import {db} from "@/lib/db";

export const dynamic="force-dynamic";

/**
 * Membership is prepaid and manually renewable. An ACTIVE membership
 * never authorizes unattended debits or card capture.
 */
export async function GET(){
 const user=await requireUser();
 if(!user)return jsonError("Нэвтрэх шаардлагатай.",401);
 const [subscription,cycles,grants]=await Promise.all([
  db.subscription.findUnique({where:{userId:user.id}}),
  db.subscriptionCycle.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:12}),
  db.creditGrant.findMany({where:{userId:user.id,remaining:{gt:0},expiresAt:{gt:new Date()}},
   orderBy:{expiresAt:"asc"},select:{paymentId:true,packageId:true,remaining:true,expiresAt:true}})
 ]);
 const active=!!subscription&&subscription.status==="ACTIVE"&&subscription.periodEnd>new Date();
 const recently=cycles.map(c=>({paymentId:c.paymentId,planId:c.planId,amountMnt:c.amountMnt,credits:c.credits,
  startedAt:c.periodStart,endsAt:c.periodEnd}));
 return NextResponse.json({
  membership:subscription?{planId:subscription.planId,status:active?"ACTIVE":"EXPIRED",
    renewalMode:"MANUAL",periodStart:subscription.periodStart,periodEnd:subscription.periodEnd,
    startedAt:subscription.startedAt}:null,
  credits:user.credits,grants,history:recently,autoRenew:false,
  note:"Сарын эрх зөвхөн баталгаажсан нэг удаагийн Wire.mn төлбөрөөр сунгагдана. Өөрөө зөвшөөрөлгүй автоматаар мөнгө татахгүй."
 },{headers:{"Cache-Control":"private, no-store"}});
}

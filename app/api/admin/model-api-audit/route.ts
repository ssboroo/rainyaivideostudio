import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/http";
import {env,higgsfieldKeyConfigured} from "@/lib/env";
import {inspectModelApi} from "@/lib/model-api-audit";
import {createSignedUpload} from "@/lib/higgsfield";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const noCache={"Cache-Control":"no-store"};
export async function GET(){
 if(!await requireAdmin())return NextResponse.json({error:"Admin эрх шаардлагатай."},{status:403,headers:noCache});
 const items=inspectModelApi();
 const totals=items.reduce((o,item)=>({...o,[item.pricing]:(o[item.pricing]||0)+1}),{} as Record<string,number>);
 return NextResponse.json({checkedAt:new Date().toISOString(),credentialConfigured:higgsfieldKeyConfigured(env.higgsfieldCredentials()),
   totals,models:items,
   disclaimer:"Endpoint schema and local quote checks only. Account-specific model access, balance and end-to-end generation are not established by this audit."},
   {headers:noCache});
}
let probeInFlight=false;
export async function POST(){
 if(!await requireAdmin())return NextResponse.json({error:"Admin эрх шаардлагатай."},{status:403,headers:noCache});
 if(probeInFlight)return NextResponse.json({error:"API холболтын шалгалт үргэлжилж байна."},{status:429,headers:noCache});
 if(!higgsfieldKeyConfigured(env.higgsfieldCredentials()))return NextResponse.json({ok:false,error:"HF_CREDENTIALS утга тохируулаагүй."},{status:503,headers:noCache});
 probeInFlight=true;
 try{
  // Only request a signed upload URL. No media is uploaded and no AI
  // generation or user-credit reservation is triggered by this action.
  const result=await createSignedUpload("image/png");
  const upload=typeof result.upload_url==="string"?new URL(result.upload_url):null;
  const publicUrl=typeof result.public_url==="string"?new URL(result.public_url):null;
  if(!upload||upload.protocol!=="https:"||!publicUrl||publicUrl.protocol!=="https:")
   throw new Error("Signed upload URL буруу байна.");
  return NextResponse.json({ok:true,scope:"authenticated_upload_url_only",
   message:"Higgsfield upload endpoint API түлхүүрээр хариуллаа. Модель ажиллуулах эрх болон баланс тусдаа шалгалт шаарддаг."},{headers:noCache});
 }catch{
  return NextResponse.json({ok:false,error:"Higgsfield upload endpoint шалгалт амжилтгүй. API key, base URL, үйлчилгээний логийг шалгана уу."},{status:502,headers:noCache});
 }finally{probeInFlight=false;}
}

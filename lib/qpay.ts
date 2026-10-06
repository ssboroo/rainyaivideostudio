import { env } from "@/lib/env";
let tokenCache:{token:string;expiresAt:number}|null=null;
function baseUrl(){return env.qpayEnv()==="production"?"https://merchant.qpay.mn":"https://merchant-sandbox.qpay.mn";}
async function getToken(){
  if(tokenCache&&tokenCache.expiresAt>Date.now()+60000)return tokenCache.token;
  const id=env.qpayClientId(), secret=env.qpayClientSecret();
  if(!id||!secret)throw new Error("QPay credential тохируулаагүй.");
  const response=await fetch(`${baseUrl()}/v2/auth/token`,{method:"POST",headers:{Authorization:`Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,"Content-Type":"application/json"},body:"{}",cache:"no-store"});
  const data=await response.json();
  if(!response.ok||!data.access_token)throw new Error(data.message||"QPay token авахад алдаа гарлаа.");
  tokenCache={token:data.access_token,expiresAt:Date.now()+Number(data.expires_in||3600)*1000}; return tokenCache.token;
}
async function qpay(path:string,body?:unknown){
  const token=await getToken();
  const response=await fetch(`${baseUrl()}${path}`,{method:body===undefined?"GET":"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body),cache:"no-store"});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.message||data.error||`QPay error (${response.status})`);
  return data;
}
export async function createQpayInvoice(a:{senderInvoiceNo:string;receiverCode:string;description:string;amountMnt:number;callbackUrl:string}){
  const code=env.qpayInvoiceCode(); if(!code)throw new Error("QPAY_INVOICE_CODE тохируулаагүй.");
  return qpay("/v2/invoice",{invoice_code:code,sender_invoice_no:a.senderInvoiceNo,invoice_receiver_code:a.receiverCode,invoice_description:a.description,amount:a.amountMnt,callback_url:a.callbackUrl});
}
export const checkQpayPayment=(invoiceId:string)=>qpay("/v2/payment/check",{object_type:"INVOICE",object_id:invoiceId,offset:{page_number:1,page_limit:10}});

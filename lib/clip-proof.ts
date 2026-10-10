import {createHmac,timingSafeEqual} from "node:crypto";
import {env} from "@/lib/env";

type ClipProof = {userId:string;url:string;seconds:number;expires:number};
function signature(body:string){
 return createHmac("sha256",env.sessionSecret()).update("ravs-clip-v1:"+body).digest("base64url");
}
/** Proof is scoped to the signed-in user, exact Higgsfield-hosted clip and TTL. */
export function issueClipProof(userId:string,url:string,seconds:number){
 if(!userId||!url.startsWith("https://")||!Number.isFinite(seconds)||seconds<=0||seconds>30)throw new Error("Клипийн мэдээлэл буруу");
 const body=Buffer.from(JSON.stringify({userId,url,seconds,expires:Date.now()+24*3600000} satisfies ClipProof)).toString("base64url");
 return body+"."+signature(body);
}
export function readClipProof(token:unknown,userId:string,url:unknown):number|null{
 if(typeof token!=="string"||token.length>8000||typeof url!=="string")return null;
 const parts=token.split(".");
 if(parts.length!==2||parts[0].length>7000||!/^[A-Za-z0-9_-]+$/.test(parts[0])||!/^[A-Za-z0-9_-]{43}$/.test(parts[1]))return null;
 try{
  const expected=Buffer.from(signature(parts[0]));
  const received=Buffer.from(parts[1]);
  if(expected.length!==received.length||!timingSafeEqual(expected,received))return null;
  const obj=JSON.parse(Buffer.from(parts[0],"base64url").toString("utf8")) as ClipProof;
  if(obj.userId!==userId||obj.url!==url||!Number.isFinite(obj.seconds)||obj.seconds<=0||obj.seconds>30||!Number.isFinite(obj.expires)||obj.expires<Date.now())return null;
  return obj.seconds;
 }catch{return null;}
}

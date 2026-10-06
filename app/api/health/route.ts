import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/session";
import { assertRuntimeConfig,env } from "@/lib/env";
export const dynamic="force-dynamic";
export async function GET(){
  const missing=assertRuntimeConfig();let database="ok";
  try{await db.$queryRaw`SELECT 1`;}catch{database="error";}
  const coreOk=missing.length===0&&database==="ok";
  let admin=false;
  try{admin=(await getSessionUser())?.role === "ADMIN";}catch{}
  return NextResponse.json({
    status:coreOk?"ok":"error",service:"ravs",...(admin?{database}:{}),
    configuration:{...(admin?{missing}:{}),higgsfield:Boolean(env.higgsfieldCredentials()),wire:Boolean(env.wireApiKey()&&env.wireWebhookSecret())},
    timestamp:new Date().toISOString()
  },{status:coreOk?200:503});
}

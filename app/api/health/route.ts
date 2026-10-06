import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertRuntimeConfig,env } from "@/lib/env";
export const dynamic="force-dynamic";
export async function GET(){
  const missing=assertRuntimeConfig();let database="ok";
  try{await db.$queryRaw`SELECT 1`;}catch{database="error";}
  const coreOk=missing.length===0&&database==="ok";
  return NextResponse.json({
    status:coreOk?"ok":"error",service:"ravs",database,
    configuration:{missing,higgsfield:Boolean(env.higgsfieldCredentials()),wire:Boolean(env.wireApiKey()&&env.wireWebhookSecret())},
    timestamp:new Date().toISOString()
  },{status:coreOk?200:503});
}

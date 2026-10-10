import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { tickMovieProducer } from "@/lib/movie-producer-v2";
export const runtime="nodejs";
export const dynamic="force-dynamic";
function validToken(request:NextRequest){
  const secret=process.env.MOVIE_WORKER_SECRET||"";
  const candidate=request.headers.get("authorization")?.replace(/^Bearer /,"")||"";
  if(secret.length<32||candidate.length!==secret.length)return false;
  return timingSafeEqual(Buffer.from(secret),Buffer.from(candidate));
}
export async function POST(request:NextRequest){
  if(!validToken(request))return NextResponse.json({error:"unauthorized"},{status:401});
  if(process.env.MOVIE_SCHEDULER_ENABLED!=="true")return NextResponse.json({status:"disabled"});
  try{return NextResponse.json(await tickMovieProducer(),{headers:{"Cache-Control":"no-store"}});}
  catch(e){console.error("Movie producer tick error",e instanceof Error?e.name:"unknown");return NextResponse.json({status:"internal_error"},{status:500});}
}
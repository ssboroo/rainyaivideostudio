import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/http";
import { createMovie, listOwnMovies, MovieError } from "@/lib/movie-producer-v2";
export const dynamic="force-dynamic";
const createSchema=z.object({
  title:z.string().max(120).optional(),
  prompt:z.string().min(12).max(6000),
  targetSeconds:z.number().int().min(4).max(3600),
  modelSlug:z.string().min(1).max(100),
  aspectRatio:z.enum(["9:16","16:9","1:1"]),
  resolution:z.enum(["480p","720p","1080p"]),
  qualityProfile:z.enum(["cinematic","balanced","fast"]).default("cinematic"),
  generateAudio:z.boolean().default(false),
  styleBible:z.string().max(2000).optional(),
  maxCredits:z.number().int().positive().max(10_000_000),
  aiQaApproved:z.boolean().default(false),
  confirmBudget:z.literal(true),
  idempotencyKey:z.string().regex(/^[A-Za-z0-9_-]{16,128}$/),
}).strict();
export async function GET(){
  const user=await requireUser();
  if(!user) return NextResponse.json({error:"Нэвтрэх шаардлагатай."},{status:401});
  if(process.env.MOVIE_SCHEDULER_ENABLED!=="true") return NextResponse.json({enabled:false,projects:[],message:"Movie Producer v2 QA туршилт хүлээж байна."},{status:503});
  return NextResponse.json({projects:await listOwnMovies(user.id)},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(request:NextRequest){
  const user=await requireUser();
  if(!user) return NextResponse.json({error:"Нэвтрэх шаардлагатай."},{status:401});
  if(process.env.MOVIE_SCHEDULER_ENABLED!=="true")
    return NextResponse.json({error:"Movie Producer scheduler туршилтын горимд байна. Одоогоор төлбөртэй урт киноны ажил эхлүүлэхгүй."},{status:503});
  if(Number(request.headers.get("content-length")||0)>20_000)
    return NextResponse.json({error:"Хүсэлт хэт том байна."},{status:413});
  const parsed=createSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success) return NextResponse.json({error:"Оролтын тохиргоо буруу байна.",issues:parsed.error.issues},{status:422});
  try{
    const movie=await createMovie(user.id,parsed.data);
    return NextResponse.json({project:movie},{status:201,headers:{"Cache-Control":"private, no-store"}});
  }catch(error){
    const status=error instanceof MovieError?error.status:400;
    return NextResponse.json({error:error instanceof Error?error.message:"Киноны ажил үүсгэж чадсангүй."},{status});
  }
}
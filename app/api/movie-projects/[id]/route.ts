import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/http";
import { getOwnMovie } from "@/lib/movie-producer-v2";
export const dynamic="force-dynamic";
export async function GET(_request:NextRequest,{params}:{params:Promise<{id:string}>}){
  const user=await requireUser();
  if(!user) return NextResponse.json({error:"Нэвтрэх шаардлагатай."},{status:401});
  const {id}=await params;
  if(!/^[a-z0-9]{10,40}$/i.test(id)) return NextResponse.json({error:"Буруу ID"},{status:400});
  const movie=await getOwnMovie(user.id,id);
  if(!movie) return NextResponse.json({error:"Төсөл олдсонгүй."},{status:404});
  return NextResponse.json({project:movie},{headers:{"Cache-Control":"private, no-store"}});
}
import {NextResponse} from 'next/server';
import {db} from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json({items:await db.demoVideo.findMany({where:{published:true},select:{id:true,title:true,category:true,videoUrl:true,sourceUrl:true},orderBy:{createdAt:'desc'},take:200})},{headers:{'Cache-Control':'no-store'}});}

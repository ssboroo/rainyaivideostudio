import {NextResponse} from 'next/server';
import {requireUser,jsonError} from '@/lib/http';
import {db} from '@/lib/db';
export const dynamic='force-dynamic';
export async function GET(){
 const user=await requireUser();if(!user)return jsonError('Нэвтэрнэ үү.',401);
 const grants=await db.creditGrant.findMany({where:{userId:user.id,remaining:{gt:0},expiresAt:{gt:new Date()}},orderBy:{expiresAt:'asc'},select:{id:true,packageId:true,remaining:true,expiresAt:true}});
 return NextResponse.json({credits:user.credits,grants},{headers:{'Cache-Control':'private, no-store'}});
}

import {PrismaClient} from '@prisma/client';
const email=process.env.ADMIN_USER_EMAIL?.trim().toLowerCase();
if(!email){console.error('ADMIN_USER_EMAIL шаардлагатай. Зөвхөн баталгаажуулсан эзэмшигчийн дансыг ашигла.');process.exit(1);}
const db=new PrismaClient();
try{
 const user=await db.user.findUnique({where:{email},select:{id:true}});
 if(!user)throw new Error('Бүртгэлтэй хэрэглэгч олдсонгүй. Шинэ админ данс автоматаар үүсгэхгүй.');
 await db.user.update({where:{id:user.id},data:{role:'ADMIN'}});
 console.log('Админ эрх шинэчлэгдлээ. Дахин нэвтэрнэ үү.');
}catch(e){console.error(e instanceof Error?e.message:'Админ эрх шинэчилж чадсангүй.');process.exitCode=1;}finally{await db.$disconnect();}

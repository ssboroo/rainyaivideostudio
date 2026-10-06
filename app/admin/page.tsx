import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { AdminClient } from "@/components/admin-client";
export const dynamic = "force-dynamic";
export const metadata = {title:"Удирдлага",robots:{index:false,follow:false}};
export default async function Page(){
 const user = await getSessionUser();
 if(!user) redirect("/login");
 if(user.role !== "ADMIN") notFound();
 return <AdminClient/>;
}

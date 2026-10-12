import "@/app/create/studio.css";
import { EmailConfirmation } from "@/components/email-confirmation";
export const metadata={title:"Имэйл баталгаажуулах"};
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){
 const params=await searchParams;
 return <div className={process.env.STUDIO_ONLY==="true"?"createStandaloneAuth":""}><EmailConfirmation token={params.token||""} createSite={process.env.STUDIO_ONLY==="true"}/></div>;
}

import { EmailConfirmation } from "@/components/email-confirmation";
export const metadata={title:"Имэйл баталгаажуулах"};
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){
 const params=await searchParams;
 return <EmailConfirmation token={params.token||""}/>;
}

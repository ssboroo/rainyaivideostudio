import {AccountEmailForm} from "@/components/account-email-form";
export const metadata={title:"Шинэ нууц үг"};
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}){
 const params=await searchParams;
 return <AccountEmailForm mode="reset" token={params.token||""}/>;
}

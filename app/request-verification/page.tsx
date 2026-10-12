import "@/app/create/studio.css";
import {AccountEmailForm} from "@/components/account-email-form";
export const metadata={title:"Баталгаажуулах имэйл"};
export default function Page(){return <div className={process.env.STUDIO_ONLY==="true"?"createStandaloneAuth":""}><AccountEmailForm mode="resend"/></div>;}

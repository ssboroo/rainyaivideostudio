import "@/app/create/studio.css";
import {AccountEmailForm} from "@/components/account-email-form";
export const metadata={title:"Нууц үг сэргээх"};
export default function Page(){return <div className={process.env.STUDIO_ONLY==="true"?"createStandaloneAuth":""}><AccountEmailForm mode="forgot"/></div>;}

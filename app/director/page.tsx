import {redirect} from "next/navigation";
import {getSessionUser} from "@/lib/session";
import {Sidebar} from "@/components/sidebar";
import {UserActions} from "@/components/user-actions";
import {DirectorWorkspace} from "@/components/director-workspace";
export const dynamic="force-dynamic";
export const metadata={title:"AI Director · RAINY"};
export default async function DirectorPage(){
 if(!await getSessionUser())redirect("/login");
 return <main className="shell"><Sidebar/><section className="content">
 <header className="topbar"><div className="topBrand"><b>RAINY · AI DIRECTOR</b></div><UserActions/></header>
 <DirectorWorkspace/></section></main>;
}

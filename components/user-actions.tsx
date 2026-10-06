"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { UserRound, WalletCards } from "lucide-react";
export function UserActions(){
 const[user,setUser]=useState<{name:string|null;credits:number}|null>(null);
 useEffect(()=>{let alive=true;fetch('/api/auth/me',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(alive)setUser(d?.user||null);}).catch(()=>null);return()=>{alive=false;};},[]);
 return <div className="topActions">{user?<Link className="ghost" href="/studio"><UserRound size={14}/>{user.name||"Миний студи"}</Link>:<><Link className="ghost" href="/login">Нэвтрэх</Link><Link className="ghost" href="/register">Бүртгүүлэх</Link></>}<Link className="creditPill" href="/billing"><WalletCards size={14}/>{user?`${user.credits} кредит`:"Кредит авах"}</Link><Link className="primary" href="/studio">Студи нээх</Link></div>;
}

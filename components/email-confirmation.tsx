"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
export function EmailConfirmation({token}:{token:string}){
 const[status,setStatus]=useState("Баталгаажуулж байна..."),[done,setDone]=useState(false);
 useEffect(()=>{
  if(!token){setStatus("Баталгаажуулах холбоос дутуу байна.");return;}
  let active=true;
  fetch("/api/auth/verify-email",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({token})})
   .then(async r=>({ok:r.ok,data:await r.json()})).then(({ok,data})=>{
     if(active){setDone(ok);setStatus(ok?"Имэйл баталгаажлаа. Студи рүү нэвтрэх боломжтой.":data.error||"Баталгаажуулах холбоос хүчингүй эсвэл хугацаа дууссан.");}
   }).catch(()=>active&&setStatus("Сүлжээний алдаа. Дахин нээнэ үү."));
  return()=>{active=false;};
 },[token]);
 return <main className="authLayout"><article className="authCard"><h1>RAINY Video Studio</h1><p role="status">{status}</p><Link className="primary wide" href={done?"/studio":"/request-verification"}>{done?"Студи рүү орох":"Шинээр холбоос авах"}</Link></article></main>;
}

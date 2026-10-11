"use client";
import Link from "next/link";
import {FormEvent,useState} from "react";
export function AccountEmailForm({mode,token=""}:{mode:"forgot"|"resend"|"reset";token?:string}){
 const[email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[success,setSuccess]=useState(false);
 const reset=mode==="reset",resend=mode==="resend";
 async function submit(e:FormEvent){e.preventDefault();if(busy)return;setBusy(true);setMessage("");
  try{
   const endpoint=reset?"/api/auth/reset-password":resend?"/api/auth/resend-verification":"/api/auth/forgot-password";
   const body=reset?{token,password}:{email};
   const response=await fetch(endpoint,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Хүсэлт амжилтгүй.");
   setMessage(result.message||"Имэйл илгээх хүсэлт хүлээн авлаа.");setSuccess(true);
  }catch(err){setMessage(err instanceof Error?err.message:"Хүсэлт амжилтгүй.");}finally{setBusy(false);}
 }
 return <main className="authLayout"><form className="authCard" onSubmit={submit}><h1>{reset?"Нууц үг шинэчлэх":resend?"Имэйл баталгаажуулах":"Нууц үг сэргээх"}</h1>
 <p>{reset?"Шинэ нууц үгээ оруулна уу.":resend?"Бүртгэлийн имэйлээ оруулаад баталгаажуулах захидал дахин аваарай.":"Бүртгэлийн имэйлд сэргээх холбоос илгээнэ."}</p>
 {reset?<label>Шинэ нууц үг<input required type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)}/></label>:<label>Имэйл<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label>}
 {message&&<p role="status">{message}</p>}
 <button className="primary wide" type="submit" disabled={busy||(!token&&reset)}>{busy?"Илгээж байна...":reset?"Нууц үг хадгалах":"Захидал илгээх"}</button>
 {success&&<p>Inbox, Promotions болон Spam хавтсаа шалгана уу.</p>}
 <Link href="/login">Нэвтрэх хуудас руу буцах</Link>
 </form></main>;
}

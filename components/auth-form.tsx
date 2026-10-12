"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, ShieldCheck, LoaderCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { RavsLogo } from "@/components/ravs-logo";
export function AuthForm({mode,returnTo,createSite=false}:{mode:"login"|"register";returnTo?:string;createSite?:boolean}){
 const register=mode==="register",router=useRouter();
 const[name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[confirm,setConfirm]=useState(""),[show,setShow]=useState(false),[error,setError]=useState(""),[busy,setBusy]=useState(false),[verificationMessage,setVerificationMessage]=useState(""),[resent,setResent]=useState(false);
 async function submit(e:FormEvent){
  e.preventDefault();if(busy)return;setError("");
  if(register&&password!==confirm){setError("Нууц үг давтан оруулсан утгатай таарахгүй байна.");return;}
  setBusy(true);
  try{const r=await fetch(`/api/auth/${mode}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name,email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Үйлчилгээ түр боломжгүй байна.");if(register&&d.verificationRequired){setVerificationMessage(d.message||"Имэйлээ баталгаажуулна уу.");return;}router.replace(returnTo?.startsWith("/oauth/authorize?")?returnTo:createSite?"/create":"/studio");router.refresh();}
  catch(e){setError(e instanceof Error?e.message:"Сүлжээний холболтоо шалгаад дахин оролдоно уу.");}finally{setBusy(false);}
 }
 async function resendVerification(){
  setBusy(true);setError("");
  try{
   const r=await fetch("/api/auth/resend-verification",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email})});
   const d=await r.json();if(!r.ok)throw new Error(d.error||"Алдаа");
   setResent(true);
  }catch(e){setError(e instanceof Error?e.message:"Алдаа");}
  finally{setBusy(false);}
 }
 return <main className="authLayout">
  <aside className="authWelcome"><Link href="/" className="authBack"><ArrowLeft size={16}/> Нүүр хуудас</Link><RavsLogo showSubtitle/><div><small>RAVS • БҮТЭЭЛЧ СТУДИ</small><h2>Таны санаа.<br/><em>Таны бүтээл.</em></h2><p>Зураг, видео, дүр болон сурталчилгааны контентоо нэг студид бүтээ.</p><ul><li><CheckCircle2 size={17}/> Монгол хэл дээрх ойлгомжтой хэрэгслүүд</li><li><CheckCircle2 size={17}/> Жишээ видео ба алхамчилсан заавар</li><li><CheckCircle2 size={17}/> Таны хувийн бүтээлийн түүх</li></ul></div><span><ShieldCheck size={16}/> Нууц үг шифрлэгдсэн хэшээр хадгалагдана</span></aside>
  <form className="authCard" onSubmit={submit} aria-busy={busy}>
   <Link href="/" className="authBrand">{createSite?"☂ RAINY Create":<RavsLogo/>}</Link><h1>{register?"Бүртгэл үүсгэх":"Тавтай морил"}</h1><p>{register?"Өөрийн бүтээлч студийг нээгээрэй.":"Имэйл, нууц үгээрээ нэвтэрнэ үү."}</p>
   {register&&<label htmlFor="auth-name">Нэр <span className="optionalLabel">(заавал биш)</span><input id="auth-name" name="name" autoComplete="name" maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="Таны нэр" disabled={busy}/></label>}
   <label htmlFor="auth-email">Имэйл<input id="auth-email" name="email" type="email" autoComplete="email" autoCapitalize="none" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" disabled={busy}/></label>
   <label htmlFor="auth-password">Нууц үг<div className="passwordField"><input id="auth-password" name="password" type={show?"text":"password"} autoComplete={register?"new-password":"current-password"} required minLength={register?8:undefined} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} placeholder={register?"Хамгийн багадаа 8 тэмдэгт":"Нууц үгээ оруулна уу"} aria-describedby={register?"password-help":undefined} disabled={busy}/><button type="button" onClick={()=>setShow(!show)} aria-label={show?"Нууц үг нуух":"Нууц үг харах"}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
   {register&&<><small id="password-help">8–128 тэмдэгт. Бусад сайтад ашигладаггүй нууц үг сонгоорой.</small><label htmlFor="auth-confirm">Нууц үг давтах<input id="auth-confirm" name="confirm" type={show?"text":"password"} autoComplete="new-password" required maxLength={128} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Дахин оруулна уу" disabled={busy}/></label></>}
   {verificationMessage&&<div className="formError" role="status">{verificationMessage} · Имэйл болон Spam хавтсаа шалгана уу.</div>}
   {error&&<div className="formError" role="alert">{error}</div>}
   {verificationMessage&&<button type="button" className="primary wide" disabled={busy} onClick={resendVerification}>{resent?"Дахин илгээх хүсэлт хүлээн авлаа":"Баталгаажуулах захидал дахин илгээх"}</button>}
   <button className="primary wide" type="submit" disabled={busy||!!verificationMessage}>{busy?<><LoaderCircle className="spin" size={17}/> Түр хүлээнэ үү…</>:register?"Бүртгэл үүсгэх":"Нэвтрэх"}</button>
   {!register&&<small><Link href="/forgot-password">Нууц үгээ мартсан уу?</Link> · <Link href="/request-verification">Баталгаажуулах имэйл дахин авах</Link></small>}
   <small>{register?<>Бүртгэлтэй юу? <Link href="/login">Нэвтрэх</Link></>:<>Шинэ хэрэглэгч үү? <Link href="/register">Бүртгэл үүсгэх</Link></>}</small>
   <Link className="authBack mobileBack" href="/"><ArrowLeft size={14}/> Нүүр хуудас</Link>
  </form>
 </main>;
}

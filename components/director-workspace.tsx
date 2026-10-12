"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
type Scene={number:number;durationSeconds:number;shot:string;videoPrompt:string;voiceover:string;subtitle:string};
type Plan={title:string;logline:string;styleBible:string;characters:string[];scenes:Scene[];subtitlesSrt:string;provider:string;model:string;estimatedOnly:true};
const fields:React.CSSProperties={width:"100%",border:"1px solid #404044",background:"#161619",color:"white",borderRadius:12,padding:14,fontSize:14};
export function DirectorWorkspace(){
 const [brief,setBrief]=useState("");const [provider,setProvider]=useState<"gpt"|"claude"|"gemini">("gpt");
 const [durationSeconds,setDuration]=useState(30),[aspectRatio,setAspect]=useState("9:16");
 const [ready,setReady]=useState<{enabled:boolean;providers:Record<string,boolean>;note:string}|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[plan,setPlan]=useState<Plan|null>(null);
 useEffect(()=>{fetch("/api/director",{cache:"no-store"}).then(r=>r.json()).then(setReady).catch(()=>setError("AI Director-ийн төлөв авч чадсангүй."));},[]);
 async function generate(){
  if(busy)return;setBusy(true);setError("");setPlan(null);
  try{
   const response=await fetch("/api/director",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({brief,provider,durationSeconds,aspectRatio})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Төлөвлөгөө гаргаж чадсангүй.");
   setPlan(result.plan);
  }catch(e){setError(e instanceof Error?e.message:"Сүлжээний алдаа.");}
  finally{setBusy(false);}
 }
 function voiceLink(text:string){
  const payload=JSON.stringify({v:1,source:"rainy-video",title:plan?.title||"RAINY Video",text:text.slice(0,3000)});
  const bytes=new TextEncoder().encode(payload),encoded=btoa(String.fromCharCode(...bytes)).replaceAll("+","-").replaceAll("/","_").replace(/=+$/,"");
  return "https://voice.rainy.studio/#rainy="+encoded;
 }
 function openVoice(text:string){if(!text.trim())return;window.open(voiceLink(text),"_blank","noopener,noreferrer");}
 function downloadSrt(){
  if(!plan)return;
  const url=URL.createObjectURL(new Blob([plan.subtitlesSrt],{type:"text/plain;charset=utf-8"}));
  const a=document.createElement("a");a.href=url;a.download="rainy-director-draft.srt";a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
 }
 const narration=(plan?.scenes||[]).map(s=>s.voiceover).filter(Boolean).join("\n\n");
 return <div style={{maxWidth:1180,margin:"0 auto",padding:"28px 20px 80px"}}>
  <div style={{padding:"32px 28px",background:"linear-gradient(130deg,#24231c,#0b0b0d)",border:"1px solid #454023",borderRadius:22,marginBottom:24}}>
   <p style={{color:"#fbd600",letterSpacing:2,fontWeight:700,fontSize:12}}>RAINY · CREATIVE AGENT</p>
   <h1 style={{fontSize:"clamp(30px,5vw,56px)",lineHeight:1.05,margin:"12px 0"}}>Нэг санаанаас зохиол, storyboard, дуу, хадмал.</h1>
   <p style={{color:"#aaa",lineHeight:1.65,maxWidth:730}}>GPT, Claude эсвэл Gemini-ээр Монгол хэлний бүтээлийн төлөвлөгөө гарга. Видео үүсгэх, ElevenLabs дуу бичих нь тусдаа хэрэглэгчийн зөвшөөрөл, кредиттэй.</p>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:15}}>
   <label>AI загвар<select style={fields} value={provider} onChange={e=>setProvider(e.target.value as typeof provider)}>
     <option value="gpt">OpenAI GPT</option><option value="claude">Anthropic Claude</option><option value="gemini">Google Gemini</option>
   </select></label>
   <label>Видео хугацаа<select style={fields} value={durationSeconds} onChange={e=>setDuration(Number(e.target.value))}>
    {[10,15,20,30,45,60,90,120].map(s=><option key={s} value={s}>{s} секунд</option>)}
   </select></label>
   <label>Харьцаа<select style={fields} value={aspectRatio} onChange={e=>setAspect(e.target.value)}>
    <option value="9:16">9:16 · Reels</option><option value="16:9">16:9 · Cinema</option><option value="1:1">1:1 · Social</option>
   </select></label>
  </div>
  <label style={{display:"block",marginTop:18}}>Кино / сурталчилгааны санаа
   <textarea style={{...fields,minHeight:180,marginTop:7,resize:"vertical"}} maxLength={4000} value={brief} onChange={e=>setBrief(e.target.value)} placeholder="Жишээ: Монгол гэрт гэр бүл өглөөний цайгаа ууж байна. Дулаан, бодит мэдрэмжтэй, 30 секундийн cinematic реклам. Монгол өгүүлэгч, зөөлөн хөгжим, гол дүрийн хувцас болон төрх тогтвортой..."/>
  </label>
  <div style={{display:"flex",alignItems:"center",gap:16,margin:"17px 0 26px",flexWrap:"wrap"}}>
   <button type="button" className="primary" disabled={busy||!ready?.enabled||!ready.providers[provider]||brief.trim().length<20} onClick={generate}>{busy?"AI төлөвлөгөө гаргаж байна…":"Зохиол, storyboard гаргах →"}</button>
   <small style={{color:"#aaa"}}>{ready&&!ready.enabled?"AI Director админы туршилтаар хаалттай.":ready&&!ready.providers[provider]?"Энэ AI-ийн API key/model тохируулаагүй.":ready?.note||"Provider холболт шалгаж байна…"}</small>
  </div>
  {error&&<p role="alert" style={{padding:15,border:"1px solid #884444",borderRadius:10,color:"#ffc1c1"}}>{error}</p>}
  {plan&&<section aria-label="AI Director төлөвлөгөө" style={{display:"grid",gap:18}}>
   <div style={{border:"1px solid #383838",borderRadius:18,padding:22}}>
    <small style={{color:"#ffd800"}}>{plan.provider.toUpperCase()} · {plan.model} · ТӨЛӨВЛӨГӨӨ</small>
    <h2 style={{fontSize:27,marginTop:10}}>{plan.title}</h2>
    <p>{plan.logline}</p><h3>Дүр, брэндийн тогтвортой хэв маяг</h3><p style={{whiteSpace:"pre-wrap",color:"#aaa"}}>{plan.styleBible}</p>
    {plan.characters.map((c,i)=><p key={i}>• {c}</p>)}
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:15}}>
     <button type="button" className="primary" onClick={()=>openVoice(narration)}>Монгол Voice → ElevenLabs</button>
     <button type="button" onClick={downloadSrt}>SRT хадмал татах</button>
     <a href="https://voice.rainy.studio/?tool=stt" target="_blank" rel="noopener noreferrer">Scribe STT · Транскрипт</a>
     <a href="https://voice.rainy.studio/?tool=dubbing" target="_blank" rel="noopener noreferrer">Dubbing v2 · Орчуулга</a>
     <a href="https://voice.rainy.studio/movie" target="_blank" rel="noopener noreferrer">Видео + дуу · MP4</a>
     <button type="button" onClick={()=>navigator.clipboard.writeText(JSON.stringify(plan,null,2))}>Төлөвлөгөө хуулах</button>
    </div>
    <p style={{color:"#aaa",fontSize:12,marginTop:12}}>SRT-ийн timecode нь storyboard-ийн хугацааны ноорог; TTS/STT-ийн бодит аудиотой тааруулж нягтлах шаардлагатай.</p>
   </div>
   {plan.scenes.map(s=><article key={s.number} style={{padding:22,borderRadius:16,border:"1px solid #303034",background:"#111113"}}>
    <small style={{color:"#ffd800"}}>SCENE {String(s.number).padStart(2,"0")} · {s.durationSeconds}с · {s.shot}</small>
    <p style={{lineHeight:1.7,whiteSpace:"pre-wrap"}}>{s.videoPrompt}</p>
    <p style={{color:"#aaa"}}>🎙 {s.voiceover||"Дуугүй кадр"}</p><p style={{color:"#aaa"}}>CC {s.subtitle||"Хадмалгүй"}</p>
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
     <button type="button" onClick={()=>navigator.clipboard.writeText(s.videoPrompt)}>Видео prompt хуулах</button>
     <button type="button" onClick={()=>openVoice(s.voiceover)}>Энэ кадрын дууг үүсгэх</button>
     <button type="button" onClick={()=>{sessionStorage.setItem("rainy_director_scene_prompt",s.videoPrompt);window.location.assign("/studio");}}>Энэ кадрыг Video Studio-д бэлтгэх →</button>
    </div>
   </article>)}
   <p style={{color:"#999"}}>Сануулга: Видео generation эхлэхээс өмнө RAINY-ийн Studio дээр сонгосон загвар, хугацаа, resolution бүрийн баталгаажсан кредитийг шалгаж зөвшөөрнө.</p>
  </section>}
 </div>;
}

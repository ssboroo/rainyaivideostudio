'use client';
import {useEffect,useRef} from 'react';
const providers=[
 {name:'Higgsfield',label:'Кино мэт AI видео',logo:'/brand/higgsfield.svg',href:'https://higgsfield.ai/higgsfield-api',video:'https://static.higgsfield.ai/higgsfield-api/launch-video.mp4'},
 {name:'ElevenLabs',label:'Сэтгэл хөдлөлтэй AI дуу',logo:'/brand/elevenlabs.svg',href:'https://elevenlabs.io/text-to-speech',video:'https://eleven-public-cdn.elevenlabs.io/payloadcms/Narrative%20_%20Story-optimised.mp4'},
];
function Promo({provider}:{provider:typeof providers[number]}){
 const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{
  const video=ref.current;if(!video)return;
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{if(preference.matches)video.pause();else void video.play().catch(()=>{});};
  update();preference.addEventListener('change',update);
  return()=>{preference.removeEventListener('change',update);video.pause();};
 },[]);
 return <article className="createPromo"><div className="createPromoHeading"><a href={provider.href} target="_blank" rel="noreferrer"><img src={provider.logo} alt={provider.name}/>{provider.name==='Higgsfield'?<b>Higgsfield</b>:null}</a><span>Танилцуулга</span></div><video ref={ref} src={provider.video} muted loop playsInline controls preload="metadata" aria-label={provider.name+' танилцуулга видео'}><a href={provider.href}>{provider.name} танилцуулга үзэх</a></video><div className="createPromoCaption"><strong>{provider.label}</strong><span>Дууг тоглуулагчаас нээнэ</span></div></article>;
}
export function ProviderPromos(){return <div className="createPromos" aria-label="AI үйлчилгээний танилцуулга">{providers.map(provider=><Promo key={provider.name} provider={provider}/>)}</div>;}

"use client";
import {useEffect,useState} from "react";
import {ExternalLink,TriangleAlert} from "lucide-react";
export function GenerationResult({type,url}:{type:"image"|"video";url:string}){
 const[failed,setFailed]=useState(false);
 useEffect(()=>setFailed(false),[url,type]);
 if(failed)return <div className="mediaMissing"><TriangleAlert size={24}/><p>Үр дүнгийн файл ачаалж чадсангүй. Гадаад хадгалалтын хугацаа дууссан байж болно.</p><a href={url} target="_blank" rel="noreferrer"><ExternalLink size={14}/> Шууд холбоосоор нээх</a></div>;
 return type==="video"?<video src={url} controls preload="metadata" playsInline onError={()=>setFailed(true)}/>:<img src={url} alt="Таны үүсгэсэн зураг" loading="lazy" onError={()=>setFailed(true)}/>;
}

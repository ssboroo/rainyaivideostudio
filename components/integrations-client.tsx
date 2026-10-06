"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
type Connection = {id:string;clientName:string;scopes:string[];createdAt:string};
export function IntegrationsClient({endpoint}:{endpoint:string}) {
  const [copied,setCopied]=useState(false),[connections,setConnections]=useState<Connection[]>([]),[status,setStatus]=useState('loading'),[error,setError]=useState(''),[busy,setBusy]=useState('');
  useEffect(()=>{let alive=true;fetch('/api/integrations',{cache:'no-store'}).then(async r=>{if(r.status===401){if(alive)setStatus('login');return;}if(!r.ok)throw new Error();const data=await r.json();if(alive){setConnections(data.connections);setStatus('ready');}}).catch(()=>{if(alive)setStatus('error');});return()=>{alive=false};},[]);
  async function revoke(id:string){if(busy)return;setBusy(id);setError('');try{const r=await fetch(`/api/integrations/${encodeURIComponent(id)}`,{method:'DELETE'});if(!r.ok)throw new Error();setConnections(rows=>rows.filter(row=>row.id!==id));}catch{setError('Эрх цуцалж чадсангүй. Дахин оролдоно уу.');}finally{setBusy('');}}
  return <>
    <div className="mcpEndpoint"><div><span>MCP серверийн холбоос</span><code>{endpoint}</code></div><button className="primary" onClick={async()=>{try{await navigator.clipboard.writeText(endpoint);setCopied(true);}catch{setError('Холбоосыг сонгоод хуулна уу.');}}}>{copied?'Хууллаа':'Холбоос хуулах'}</button></div>
    <section className="mcpConnections"><h2>Миний зөвшөөрсөн холболтууд</h2><p>Апп бүр зөвхөн таны RAVS бүртгэлд өгсөн эрхээр ажиллана. Эрх цуцалбал тухайн холболтын бүх токен хүчингүй болно.</p>
      {status==='loading'?<p role="status">Холболтуудыг шалгаж байна…</p>:status==='login'?<p><Link className="primary" href="/login">RAVS бүртгэлээр нэвтрэх</Link></p>:status==='error'?<p role="alert">Холболтуудыг ачаалж чадсангүй. Хуудсыг дахин ачаална уу.</p>:connections.length===0?<p>Одоогоор зөвшөөрсөн холболт байхгүй. Доорх заавраар аппдаа MCP холбоосыг нэмээд RAVS дээр зөвшөөрөл өгнө.</p>:<div className="mcpConnectionList">{connections.map(c=><article key={c.id}><div><h3>{c.clientName}</h3><p>{c.scopes.includes('ravs:generate')?'Унших, бүтээл үүсгэх ба цуцлах':'Загвар, кредит, өөрийн бүтээлүүдийг унших'}</p><small>{new Date(c.createdAt).toLocaleDateString('mn-MN')}</small></div><button className="pill" disabled={!!busy} onClick={()=>revoke(c.id)}>{busy===c.id?'Цуцалж байна…':'Эрх цуцлах'}</button></article>)}</div>}
      {error&&<p role="alert">{error}</p>}
    </section>
  </>;
}

"use client";

import { useState } from "react";
import { models } from "@/lib/models";
import { ArrowUp, ImagePlus, SlidersHorizontal, WandSparkles } from "lucide-react";

export function Generator() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(models[0].id);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function generate() {
    if (!prompt.trim()) { setMessage("Prompt бичнэ үү."); return; }
    setBusy(true); setMessage("");
    try {
      const r = await fetch("/api/higgsfield/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt, model }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Generation эхлүүлж чадсангүй");
      setMessage(`Generation эхэллээ: ${data.request_id ?? "queued"}`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Алдаа гарлаа"); }
    finally { setBusy(false); }
  }

  return (
    <div className="generatorCard">
      <div className="generatorTop">
        <div className="seg active">Видео</div><div className="seg">Зураг</div><div className="seg">Зар</div>
      </div>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Юу бүтээх вэ? Монгол хэлээр хүссэн зүйлээ бичээрэй…" />
      <div className="quickRow">
        <button><ImagePlus size={16}/> Reference</button>
        <button><WandSparkles size={16}/> Prompt сайжруулах</button>
        <button><SlidersHorizontal size={16}/> Тохиргоо</button>
      </div>
      <div className="generatorBottom">
        <select value={model} onChange={e=>setModel(e.target.value)}>
          {models.filter(m=>m.kind !== "image").map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <div className="chips"><span>9:16</span><span>10 сек</span><span>1080p</span></div>
        <button onClick={generate} disabled={busy} className="go">{busy ? "Үүсгэж байна…" : "Үүсгэх"}<ArrowUp size={18}/></button>
      </div>
      {message && <p className="statusMsg">{message}</p>}
    </div>
  );
}

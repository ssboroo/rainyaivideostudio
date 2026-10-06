"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowUp,
  CheckCircle2,
  ChevronRight,
  Clapperboard,
  Image as ImageIcon,
  ImagePlus,
  LoaderCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Square,
  Upload,
  Video,
  WalletCards,
  WandSparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import { GenerationResult } from "@/components/generation-result";
import { WorkflowIcon } from "@/components/workflow-icon";
import { mediaFrom } from "@/lib/generation-media";
import { Sidebar } from "@/components/sidebar";
import { CommunityInspiration } from "@/components/community-inspiration";
import { buildProviderInput, estimateCredits, getModel, models, type ModelKind, type RavsModel } from "@/lib/models";

type User = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
};

type Generation = {
  id: string;
  modelSlug: string;
  modelId: string;
  prompt: string;
  status: string;
  costCredits: number;
  output: unknown;
  error: unknown;
  createdAt: string;
  refunded: boolean;
};

type ProviderHealth = "checking" | "ready" | "missing";

function surfaceLabel(kind: ModelKind | "all") {
  if (kind === "video") return "Видео";
  if (kind === "image") return "Зураг";
  if (kind === "workflow") return "Workflow";
  return "Бүгд";
}

function quickPrompts(model: RavsModel) {
  if (model.slug === "marketing-studio") {
    return ["Clean product hero shot", "Bold social ad", "Marketplace listing", "Luxury campaign"];
  }
  if (model.group === "Genjutsu") {
    return ["Keep the motion, change the world", "Replace the outfit and product", "Cinematic dark restyle"];
  }
  if (model.slug === "ai-influencer") {
    return ["Монгол төрхтэй modern lifestyle creator", "Clean beauty creator", "Bold street fashion persona"];
  }
  if (model.kind === "image") {
    return ["Editorial portrait", "Premium poster", "Brand campaign", "Cinematic still"];
  }
  return ["Cinematic tracking shot", "Fast social reel", "Luxury commercial", "Night city sequence"];
}

function statusText(status: string) {
  const map: Record<string, string> = {
    PENDING: "Хүлээж байна",
    SUBMITTED: "Queue-д",
    PROCESSING: "Үүсгэж байна",
    COMPLETED: "Бэлэн",
    FAILED: "Алдаа",
    NSFW: "Content filter",
    CANCELED: "Цуцлагдсан",
  };
  return map[status] || status;
}

export function StudioClient() {
  const router = useRouter();
  const params = useSearchParams();


  const [surface, setSurface] = useState<ModelKind | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(models[0].slug);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState("720p");
  const [aspect, setAspect] = useState("9:16");
  const [audio, setAudio] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [refs, setRefs] = useState<string[]>([]);
  const [presetId, setPresetId] = useState("");
  const [presets, setPresets] = useState<Array<{ id: string; name: string }>>([]);
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<Generation[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [presetError, setPresetError] = useState("");
  const [message, setMessage] = useState("");
  const [providerHealth, setProviderHealth] = useState<ProviderHealth>("checking");

  const model = getModel(selected) || models[0];
  const cost = estimateCredits(model, duration);
  const group = params.get("group");

  const visibleModels = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return models.filter((item) => {
      if (group && item.group !== group) return false;
      if (surface !== "all" && item.kind !== surface) return false;
      if (!needle) return true;
      return [item.name, item.maker, item.group, item.badge, item.description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [group, search, surface]);

  useEffect(() => {

    const queryModel = params.get("model");
    const querySurface = params.get("surface");
    if (queryModel && getModel(queryModel)) setSelected(queryModel);
    else if (group) {
      const first = models.find((item) => item.group === group);
      if (first) setSelected(first.slug);
    }
    if (querySurface === "video" || querySurface === "image" || querySurface === "workflow") setSurface(querySurface);
  }, [group, params.get("model"), params.get("surface")]);

  useEffect(()=>{const queryPrompt=params.get("prompt");if(queryPrompt)setPrompt(queryPrompt);},[params.get("prompt")]);

  useEffect(() => {
    const requestedDuration = Number(params.get("duration"));
    const safeDuration = Number.isFinite(requestedDuration) && model.minDuration && model.maxDuration
      ? Math.max(model.minDuration, Math.min(requestedDuration, model.maxDuration))
      : model.minDuration || 5;
    const requestedAspect = params.get("aspect");
    setDuration(safeDuration);
    setResolution(model.resolutions[0]);
    setAspect(requestedAspect && model.aspectRatios.includes(requestedAspect) ? requestedAspect : model.aspectRatios[0]);
    setImageUrl("");
    setVideoUrl("");
    setRefs([]);
    setPresetId("");
    setPresets([]);
    setPresetError("");
    setMessage("");
    if (model.slug === "genjutsu-restyle") {
      fetch("/api/catalog/presets?kind=restyle")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => { const items=Array.isArray(data?.items)?data.items:[];setPresets(items);if(!items.length)setPresetError("Хэв маягийн жагсаалт түр боломжгүй байна. Өөр хэрэгсэл сонгоорой."); })
        .catch(() => setPresetError("Хэв маяг ачаалж чадсангүй."));
    }
  }, [selected, params.get("duration"), params.get("aspect")]);

  async function load() {
    setHistoryLoading(true); setLoadError("");
    try {
      const me = await fetch("/api/auth/me", {cache:"no-store"});
      if(!me.ok) throw new Error("Бүртгэлийн мэдээлэл ачаалж чадсангүй.");
      const meData = await me.json();
      if(!meData.user){router.replace("/login");return;}
      setUser(meData.user);
      const response = await fetch("/api/generations", {cache:"no-store"});
      if(!response.ok)throw new Error("Бүтээлийн түүх ачаалж чадсангүй. Дахин оролдоно уу.");
      const data = await response.json();setHistory(data.generations || []);
      setUser(current=>current?{...current,credits:data.user?.credits??current.credits}:current);
    } catch(e) {setLoadError(e instanceof Error?e.message:"Сүлжээний холболтоо шалгана уу.");}
    finally {setHistoryLoading(false);}
  }

  useEffect(() => {
    void load();
    fetch("/api/health", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setProviderHealth(data?.configuration?.higgsfield ? "ready" : "missing"))
      .catch(() => setProviderHealth("missing"));
  }, []);

  useEffect(() => {
    const active = history.filter((item) => !["COMPLETED", "FAILED", "NSFW", "CANCELED"].includes(item.status));
    if (!active.length) return;
    let polling=false;
    const timer = window.setInterval(async () => {
      if(polling)return;polling=true;
      try {
      for (const item of active) {
        const response = await fetch("/api/generations/" + item.id, { cache: "no-store" });
        if (!response.ok) continue;
        const data = await response.json();
        setHistory((current) => current.map((entry) => (entry.id === item.id ? data.generation : entry)));
        if(data.providerError)setMessage("Үүсгэлтийн төлөв түр шинэчлэгдсэнгүй. Дахин шалгаж байна.");
        if (data.credits !== undefined) {
          setUser((current) => (current ? { ...current, credits: data.credits } : current));
        }
      }
      } catch { setMessage("Холболт тасарлаа. Бүтээлээ дахин шалгана уу."); } finally {polling=false;}
    }, 4500);
    return () => window.clearInterval(timer);
  }, [history.map((item) => item.id + item.status).join("|")]);

  async function upload(file: File, kind: "image" | "video" | "ref") {
    if(uploading)return;
    const allowed=["image/png","image/jpeg","image/webp","video/mp4"];
    if(!allowed.includes(file.type))throw new Error("PNG, JPG, WebP зураг эсвэл MP4 видео оруулна уу.");
    if(kind!=="video"&&!file.type.startsWith("image/"))throw new Error("Зураг оруулна уу.");
    if(kind==="video"&&file.type!=="video/mp4")throw new Error("MP4 видео оруулна уу.");
    setUploading(true);
    try {
    setMessage("Жишиг файл байршуулж байна…");
    if (file.size > 200 * 1024 * 1024) throw new Error("Файл 200MB-аас бага байна.");
    const signed = await fetch("/api/uploads/sign", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contentType: file.type }),
    });
    const signedData = await signed.json();
    if (!signed.ok) throw new Error(signedData.error || "Upload sign алдаа");

    const uploaded = await fetch(signedData.upload_url, {
      method: "PUT",
      headers: signedData.upload_headers || {},
      body: file,
      credentials: "omit",
    });
    if (!uploaded.ok) throw new Error("Reference upload амжилтгүй.");

    const publicUrl = signedData.public_url;
    if(typeof publicUrl!=="string"||!publicUrl.startsWith("https://"))throw new Error("Файлын холбоос буруу байна.");
    if (kind === "image") setImageUrl(publicUrl);
    else if (kind === "video") setVideoUrl(publicUrl);
    else {
      const max = model.maxReferences || 16;
      setRefs((current) => [...current, publicUrl].slice(0, max));
    }
    setMessage("Жишиг файл бэлэн.");
    } finally {setUploading(false);}
  }

  const hasInput = Boolean(prompt.trim() || imageUrl || videoUrl || refs.length);
  let inputError="";
  try {buildProviderInput(model,{prompt,imageUrl,videoUrl,referenceUrls:refs,presetId});}catch(e){inputError=e instanceof Error?e.message:"Оролтоо шалгана уу.";}
  const canSubmit = !busy && !uploading && hasInput && !inputError && !!user && user.credits>=cost && providerHealth==="ready";

  async function submit() {
    if (!user || !canSubmit) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          modelSlug: selected,
          prompt,
          duration,
          resolution,
          aspectRatio: aspect,
          generateAudio: audio,
          imageUrl,
          videoUrl,
          referenceUrls: refs,
          presetId,
          enhancePrompt: true,
          quality: "high",
        }),
      });
      const data = await response.json();
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error(data.error || "Generation эхлүүлж чадсангүй.");
      setHistory((current) => [data.generation, ...current]);
      setUser((current) => (current ? { ...current, credits: data.credits } : current));
      setMessage("Generation queue-д орлоо. Result доорх feed дээр автоматаар шинэчлэгдэнэ.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Алдаа гарлаа.");
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: string) {
    try {const r=await fetch("/api/generations/"+id,{method:"DELETE"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Цуцалж чадсангүй.");await load();}catch(e){setMessage(e instanceof Error?e.message:"Цуцалж чадсангүй.");}
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");router.refresh();
  }

  function chooseModel(slug: string) {
    setSelected(slug);
    const next = new URLSearchParams(params.toString());
    next.set("model", slug);
    next.delete("group");
    router.replace("/studio?" + next.toString(), { scroll: false });
  }

  return (
    <main className="shell studioShell">
      <Sidebar />
      <section className="content studioContent">
        <header className="topbar">
          <div className="topBrand">
            <b>RAVS Studio</b>
            <span>Video · Image · Workflow</span>
          </div>
          <div className="topActions">
            <span className={"providerDot " + providerHealth}>
              <i />
              {providerHealth === "ready" ? "Үйлчилгээ бэлэн" : providerHealth === "checking" ? "Үйлчилгээ шалгаж байна" : "Үйлчилгээ бэлтгэгдэж байна"}
            </span>
            <a href="/billing" className="creditPill"><WalletCards size={15} />{user?.credits ?? 0} credit</a>
            <button className="ghost" onClick={logout}>Гарах</button>
          </div>
        </header>

        <div className="studioV2">
          <aside className="modelBrowser">
            <div className="browserHeader">
              <b>Models</b>
              <span>{visibleModels.length}</span>
            </div>
            <label className="modelSearch">
              <Search size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Model хайх" />
            </label>
            <div className="surfaceTabs">
              {(["all", "video", "image", "workflow"] as const).map((item) => (
                <button key={item} className={surface === item ? "active" : ""} onClick={() => setSurface(item)}>
                  {surfaceLabel(item)}
                </button>
              ))}
            </div>
            <div className="modelList">
              {visibleModels.map((item) => (
                <button
                  key={item.slug}
                  onClick={() => chooseModel(item.slug)}
                  className={"modelItem " + (selected === item.slug ? "active" : "")}
                >
                  <div className={"modelGlyph tone-" + (item.tone || "violet")}><WorkflowIcon id={item.slug} size={20}/></div>
                  <div>
                    <b>{item.name}</b>
                    <small>{item.maker || item.provider} · {item.badge}</small>
                  </div>
                  <span>{item.creditRate}{item.pricingType === "second" ? "/s" : ""}</span>
                </button>
              ))}
              {!visibleModels.length && <div className="browserEmpty">Тохирох model олдсонгүй.</div>}
            </div>
          </aside>

          <section className="creativeWorkspace">
            <div className="workspaceTop">
              <div>
                <div className="modelCrumb"><span>{model.group}</span><ChevronRight size={12} /><span>{model.maker || model.provider}</span></div>
                <h1>{model.name}</h1>
                <p>{model.description}</p>
              </div>
              <div className="estimateBadge"><span>Estimate</span><b>{cost} credit</b></div>
            </div>

            <div className="composerPanel">
              <div className="composerMode">
                <span className={"modelGlyph tiny tone-" + (model.tone || "violet")}><WorkflowIcon id={model.slug} size={20}/></span>
                <div><b>{model.name}</b><small>{model.capabilities?.join(" · ")}</small></div>
                <a className="outlineIcon" href="#studio-settings" aria-label="Үүсгэлтийн тохиргоо"><SlidersHorizontal size={15}/></a>
              </div>

              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={model.requiresPrompt === false
                  ? "Optional prompt — reference-ээ оруулаад шууд generate хийж болно…"
                  : "Монгол хэлээр санаагаа бич. Subject, camera, хөдөлгөөн, гэрэл, style-аа хүссэнээрээ тайлбарла…"}
              />

              <div className="quickPromptRow">
                {quickPrompts(model).map((item) => (
                  <button key={item} onClick={() => setPrompt((current) => current ? current + ", " + item : item)}>
                    <Sparkles size={12} /> {item}
                  </button>
                ))}
              </div>

              <div className="referenceStrip">
                {model.supportsImage && (
                  <label className={"referenceSlot " + (imageUrl ? "filled" : "")}>
                    <ImagePlus size={17} />
                    <span>{imageUrl ? "Primary image бэлэн" : "Primary image"}</span>
                    <input
                      type="file"
                      disabled={uploading || providerHealth!=="ready"}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "image").catch((error) => setMessage(error.message))}
                    />
                  </label>
                )}
                {model.supportsVideo && (
                  <label className={"referenceSlot " + (videoUrl ? "filled" : "")}>
                    <Video size={17} />
                    <span>{videoUrl ? "Source video бэлэн" : "Source video"}</span>
                    <input
                      type="file"
                      disabled={uploading || providerHealth!=="ready"}
                      accept="video/mp4"
                      onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "video").catch((error) => setMessage(error.message))}
                    />
                  </label>
                )}
                {model.supportsMultipleReferences && (
                  <label className="referenceSlot">
                    <Upload size={17} />
                    <span>References {refs.length}/{model.maxReferences || 16}</span>
                    <input
                      type="file"
                      disabled={uploading || providerHealth!=="ready"}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "ref").catch((error) => setMessage(error.message))}
                    />
                  </label>
                )}
                {!model.supportsImage && !model.supportsVideo && !model.supportsMultipleReferences && (
                  <div className="referenceHint"><WandSparkles size={16} /> Prompt-only model</div>
                )}
              </div>

              {presetError&&<p className="serviceState" role="status">{presetError}</p>}
              <div className="inputPreview">{[imageUrl,...refs].filter(Boolean).map((url,index)=><div key={url+index}><img src={url} alt={`Жишиг зураг ${index+1}`}/><button aria-label="Жишиг зураг хасах" onClick={()=>imageUrl===url?setImageUrl(""):setRefs(current=>current.filter(value=>value!==url))}><X size={12}/></button></div>)}{videoUrl&&<button className="ghost" onClick={()=>setVideoUrl("")}><Video size={14}/> Жишиг видео хасах</button>}</div>
              {presets.length > 0 && (
                <select className="fullSelect" value={presetId} onChange={(event) => setPresetId(event.target.value)}>
                  <option value="">Restyle preset сонгох</option>
                  {presets.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                </select>
              )}

              <div className="composerBottom">
                <div className="inlineSettings" id="studio-settings">
                  {model.minDuration && model.maxDuration && (
                    <label>
                      <span>Хугацаа</span>
                      <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                        {Array.from({ length: model.maxDuration - model.minDuration + 1 }, (_, index) => model.minDuration! + index)
                          .map((value) => <option value={value} key={value}>{value} сек</option>)}
                      </select>
                    </label>
                  )}
                  <label>
                    <span>Чанар</span>
                    <select value={resolution} onChange={(event) => setResolution(event.target.value)}>
                      {model.resolutions.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>Харьцаа</span>
                    <select value={aspect} onChange={(event) => setAspect(event.target.value)}>
                      {model.aspectRatios.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  {model.supportsAudio && (
                    <label className="audioToggle">
                      <span>Audio</span>
                      <input type="checkbox" checked={audio} onChange={(event) => setAudio(event.target.checked)} />
                    </label>
                  )}
                </div>

                <button className="generateButton" disabled={!canSubmit} onClick={submit}>
                  {busy ? <LoaderCircle className="spin" size={17} /> : <ArrowUp size={17} />}
                  <span>{busy ? "Илгээж байна" : "Үүсгэх"}</span>
                  <b>{cost} cr</b>
                </button>
              </div>

              {inputError&&hasInput&&<p className="serviceState">{inputError}</p>}
              {providerHealth==="missing"&&<div className="accountNotice"><Sparkles size={20}/><div>Үүсгэх үйлчилгээ бэлтгэгдэж байна. Одоогоор жишээ үзэж, санаа болон тохиргоогоо бэлдээрэй. <Link href="/video-guide">Гарын авлага үзэх →</Link></div></div>}
              {user&&user.credits<cost&&<p className="serviceState">Энэ бүтээлд {cost} кредит хэрэгтэй. Таны үлдэгдэл {user.credits}. <Link href="/billing">Кредитийн багц үзэх →</Link></p>}
              {message && <div className={"studioMessage " + (message.includes("алдаа") || message.includes("дутуу") ? "error" : "")}>{message}</div>}
            </div>

            <section className="modelInfoStrip">
              <div><small>INPUT</small><b>{model.supportsVideo ? "Video + " : ""}{model.supportsImage || model.supportsMultipleReferences ? "Reference + " : ""}Prompt</b></div>
              <div><small>OUTPUT</small><b>{model.kind === "image" ? "Image" : "Video"}</b></div>
              <div><small>RESOLUTION</small><b>{model.resolutions.join(" · ")}</b></div>
              <div><small>БҮТЭЭЛҮҮД</small><b>Хувийн түүх</b></div>
            </section>

            <CommunityInspiration surface={model.kind === "video" ? "video" : model.group === "Genjutsu" ? "apps" : model.group === "Cinema" ? "cinema" : model.group === "Ads" ? "marketing" : model.group === "Influencer" ? "influencer" : "explore"} limit={4} title="Энэ model-д тохирох community inspiration" />
            <section id="generations" className="generationSection">
              <div className="historyHead">
                <div><small>GENERATIONS</small><h2>Миний бүтээлүүд</h2></div>
                <button className="ghost" onClick={load}><RefreshCw size={14} /> Шинэчлэх</button>
              </div>

              <div className="generationMasonry">
                {history.map((item) => {
                  const media = mediaFrom(item.output);
                  const itemModel = getModel(item.modelSlug);
                  const active = !["COMPLETED", "FAILED", "NSFW", "CANCELED"].includes(item.status);
                  return (
                    <article className="generationCard" key={item.id}>
                      <div className="generationMedia">
                        {media?.type === "video" ? (
                          <GenerationResult type="video" url={media.url}/>
                        ) : media?.type === "image" ? (
                          <GenerationResult type="image" url={media.url}/>
                        ) : (
                          <div className="generationPlaceholder">
                            {active ? <LoaderCircle className="spin" /> : <Square />}
                            <span>{statusText(item.status)}</span>
                          </div>
                        )}
                        <span className={"statusBadge " + item.status.toLowerCase()}>{statusText(item.status)}</span>
                        {media && (
                          <div className="mediaActions">
                            <a href={media.url} target="_blank" rel="noreferrer" aria-label="Open result"><ImageIcon size={14} /></a>
                            <a href={media.url} download aria-label="Download result"><ArrowDownToLine size={14} /></a>
                          </div>
                        )}
                      </div>
                      <div className="generationMeta">
                        <div><b>{itemModel?.name || item.modelSlug}</b><span>{item.costCredits} cr</span></div>
                        <p>{item.prompt || "Жишиг файлаар бүтээсэн"}</p>
                        {item.status==="FAILED"&&<p className="generationError">Үүсгэлт амжилтгүй боллоо. Оролтоо шалгаад дахин оролдоно уу.</p>}
                        {item.status==="COMPLETED"&&!media&&<p className="generationError">Үр дүнгийн холбоос олдсонгүй. Дахин шинэчилж шалгана уу.</p>}
                        <small>{new Date(item.createdAt).toLocaleString("mn-MN")}</small>
                        <div className="generationFooter">
                          {["PENDING","SUBMITTED"].includes(item.status) && <button onClick={() => cancel(item.id)}><X size={12} /> Цуцлах</button>}
                          {item.refunded && <span className="refund"><CheckCircle2 size={12} /> Credit буцаасан</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
                {loadError&&<div className="formError" role="alert">{loadError} <button className="ghost" onClick={load}>Дахин оролдох</button></div>}
                {historyLoading&&<div className="screenEmpty" role="status"><LoaderCircle className="spin"/><p>Бүтээлийн түүхийг ачаалж байна…</p></div>}
                {!historyLoading&&!loadError&&!history.length && (
                  <div className="screenEmpty">

                    <Sparkles size={20} />
                    <h3>Эхний бүтээлээ үүсгээрэй</h3>
                    <p>Эхний бүтээл хүртэл дараах алхмыг дагаарай.</p><div className="guideSteps"><div><Clapperboard/><h3>1. Хэрэгсэл сонго</h3><p>Видео, зураг эсвэл хөдөлгөөн хувиргах хэрэгслээс сонго.</p></div><div><ImagePlus/><h3>2. Санаагаа оруул</h3><p>Санаагаа тайлбарлах эсвэл жишиг файл оруулж, хэмжээ ба хугацаагаа тохируул.</p></div><div><ArrowDownToLine/><h3>3. Үүсгээд тат</h3><p>Бэлэн бүтээлээ эндээс тоглуулж, нээж, татаж авна. Гадаад файлын хадгалалтын хугацаа хязгаартай тул татаж хадгалаарай.</p></div></div><Link className="ghost" href="/video-guide">Видео гарын авлага →</Link>
                  </div>
                )}
              </div>
            </section>
          </section>

          <aside className="contextRail">
            <div className="contextCard">
              <small>MODEL</small>
              <div className={"contextModel tone-" + (model.tone || "violet")}><WorkflowIcon id={model.slug} size={20}/></div>
              <h3>{model.name}</h3>
              <p>{model.description}</p>
              <div className="contextTags">{model.capabilities?.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
            <div className="contextCard">
              <small>CHECKLIST</small>
              <ul className="checkList">
                <li className={hasInput ? "done" : ""}><i /> Prompt эсвэл reference</li>
                <li className={user && user.credits >= cost ? "done" : ""}><i /> {cost} credit</li>
                <li className={providerHealth === "ready" ? "done" : ""}><i /> Үүсгэх үйлчилгээ</li>
              </ul>
            </div>
            <div className="contextCard helperCard">
              <WandSparkles size={18} />
              <b>Prompt зөвлөгөө</b>
              <p>Subject → action → camera → lighting → mood → finish гэсэн дарааллаар бичвэл video prompt илүү ойлгомжтой болдог.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

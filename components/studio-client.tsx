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
import { ModelGuide } from "@/components/model-guide";
import { parameterLabel, parameterHelp, optionLabel, modelGuide, resolutionLabel, aspectLabel } from "@/lib/model-guides";
import { GenerationResult } from "@/components/generation-result";
import { generationAttempt, clearGenerationAttempt, type GenerationAttempt } from "@/lib/generation-attempt";
import { Sidebar } from "@/components/sidebar";
import { ModelFamilies } from "@/components/model-families";
import { modelFamilyName, modelVariantLabel } from "@/lib/model-families";
import { ModelExamples } from "@/components/model-examples";
import { YouTubeGenjutsuSource } from "@/components/youtube-genjutsu-source";
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
  prompt: string;
  status: string;
  costCredits: number;
  media: { type: "image" | "video"; url: string } | null;
  warning?: string;
  message?: string;
  createdAt: string;
  refunded: boolean;
};

type ProviderHealth = "checking" | "ready" | "missing";

function surfaceLabel(kind: ModelKind | "all") {
  if (kind === "video") return "Видео";
  if (kind === "image") return "Зураг";
  if (kind === "workflow") return "Хөдөлгөөн / Засвар";
  return "Бүгд";
}

function quickPrompts(model: RavsModel) {
  return [modelGuide(model).prompt, model.kind === "image" ? "Зөөлөн студийн гэрэл, бодит бүтэц, цэвэр дэвсгэр" : "Камер зөөлөн ойртоно, нэг гол үйлдэл, байгалийн гэрэл"];
}

function statusText(status: string) {
  const map: Record<string, string> = {
    PENDING: "Хүлээж байна",
    SUBMITTED: "Дараалалд",
    PROCESSING: "Үүсгэж байна",
    COMPLETED: "Бэлэн",
    FAILED: "Алдаа",
    NSFW: "Агуулгын шүүлтүүр",
    CANCELED: "Цуцлагдсан",
  };
  return map[status] || status;
}

export function StudioClient() {
  const router = useRouter();
  const params = useSearchParams();


  const [surface, setSurface] = useState<ModelKind | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState((models.find(m=>m.modelId==="minimax/hailuo-2.3/standard/text-to-video") || models[0]).slug);
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState("720p");
  const [aspect, setAspect] = useState("9:16");
  const [audio, setAudio] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [clipToken,setClipToken]=useState("");
  const [clipSeconds,setClipSeconds]=useState<number|null>(null);
  const [refs, setRefs] = useState<string[]>([]);
  const [modelOptions,setModelOptions]=useState<Record<string,unknown>>({});
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
  const submitLock = useRef(false);
  const attempt = useRef<GenerationAttempt | null>(null);

  const model = getModel(selected) || models[0];
  const clipGenjutsu = ["genjutsu-motion","genjutsu-restyle"].includes(model.slug);
  const clipPending = clipGenjutsu && (!videoUrl || clipSeconds===null || !clipToken);
  const apiNotReady = !model.apiVerified;
  let cost = 0;
  let pricingError = "";
  // Never attempt to quote an API model whose endpoint has not been verified.
  // An incomplete Genjutsu clip is a preparation step, not a price error.
  if(!apiNotReady && !clipPending) {
    try {
      cost = estimateCredits(model, duration, { ...modelOptions, resolution, aspect_ratio: aspect, sound: audio ? "on" : "off", generate_audio: audio, video_url: videoUrl || undefined,
        __verifiedClipSeconds: clipGenjutsu && clipToken ? clipSeconds ?? undefined : undefined });
    } catch (error) {
      const detail=error instanceof Error ? error.message : "";
      pricingError=detail.startsWith("Энэ тохиргооны API өртгийг баталгаажуулж байна")
        ? model.name+" ("+resolution+") загварын API үнэ одоогоор баталгаажаагүй. Кредит зарцуулахгүй."
        : detail || "API үнэ баталгаажаагүй. Кредит зарцуулахгүй.";
    }
  }
  const group = params.get("group");

  const visibleModels = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return models.filter((item) => {
      if (group && item.group !== group) return false;
      if (surface !== "all" && item.kind !== surface) return false;
      if (!needle) return true;
      return [item.name, modelFamilyName(item), modelVariantLabel(item), item.maker, item.group, item.badge, item.description]
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
      const first = models.find((item) => item.group === group && item.modelId === "minimax/hailuo-2.3/standard/text-to-video") || models.find((item) => item.group === group);
      if (first) setSelected(first.slug);
    }
    if (querySurface === "video" || querySurface === "image" || querySurface === "workflow") setSurface(querySurface);
  }, [group, params.get("model"), params.get("surface")]);

  useEffect(()=>{const queryPrompt=params.get("prompt");if(queryPrompt)setPrompt(queryPrompt);},[params.get("prompt")]);

  useEffect(() => {
    const requestedDuration = params.has("duration") ? Number(params.get("duration")) : Number(model.parameters?.find(f=>f.name==="duration")?.default || model.minDuration || 5);
    const safeDuration = Number.isFinite(requestedDuration) && model.minDuration && model.maxDuration
      ? Math.max(model.minDuration, Math.min(requestedDuration, model.maxDuration))
      : model.minDuration || 5;
    const requestedAspect = params.get("aspect");
    setDuration(model.durationOptions?.includes(safeDuration)===false ? model.durationOptions[0] : safeDuration);
    setResolution(model.resolutions[0]);
    setAudio(Boolean(model.parameters?.find(f=>f.name==="generate_audio")?.default ?? (model.parameters?.find(f=>f.name==="sound")?.default !== "off" && model.parameters?.find(f=>f.name==="keep_original_sound")?.default !== "no")));
    setAspect(requestedAspect && model.aspectRatios.includes(requestedAspect) ? requestedAspect : model.aspectRatios[0]);
    setModelOptions({});
    setImageUrl("");
    setVideoUrl("");
    setClipToken("");
    setClipSeconds(null);
    setRefs([]);
    setPresetId("");
    setPresets([]);
    setPresetError("");
    setMessage("");
    if (model.slug === "genjutsu-restyle" || model.modelId.startsWith("marketing-studio/image")) {
      const presetKind = model.slug === "genjutsu-restyle" ? "restyle" : "marketing";
      fetch("/api/catalog/presets?kind="+presetKind)
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
    const active = history.filter((item) => !["COMPLETED", "FAILED", "NSFW", "CANCELED"].includes(item.status) || (["FAILED", "NSFW", "CANCELED"].includes(item.status) && !item.refunded));
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
        if(data.warning)setMessage(data.warning);
        if (data.credits !== undefined) {
          setUser((current) => (current ? { ...current, credits: data.credits } : current));
        }
      }
      } catch { setMessage("Холболт тасарлаа. Бүтээлээ дахин шалгана уу."); } finally {polling=false;}
    }, 4500);
    return () => window.clearInterval(timer);
  }, [history.map((item) => item.id + item.status + item.refunded).join("|")]);

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
    else if (kind === "video") { setVideoUrl(publicUrl); setClipToken(""); setClipSeconds(null); }
    else {
      const max = model.maxReferences || 16;
      setRefs((current) => [...current, publicUrl].slice(0, max));
    }
    setMessage("Жишиг файл бэлэн.");
    } finally {setUploading(false);}
  }

  const hasInput = Boolean(prompt.trim() || imageUrl || videoUrl || refs.length || Object.values(modelOptions).some(value=>value!==undefined&&value!==null&&value!==""));
  let inputError="";
  try {buildProviderInput(model,{prompt,imageUrl,videoUrl,referenceUrls:refs,presetId,duration,resolution,aspectRatio:aspect,generateAudio:audio,modelOptions});}catch(e){inputError=e instanceof Error?e.message:"Оролтоо шалгана уу.";}
  const canSubmit = !busy && !uploading && !clipPending && !!model.apiVerified && hasInput && !inputError && !pricingError && !!user && user.credits>=cost && providerHealth==="ready";

  async function submit() {
    if (!user || !canSubmit || submitLock.current) return;
    submitLock.current = true;
    setBusy(true);
    setMessage("");
    try {
      const input = { modelSlug: selected, prompt, duration, resolution, aspectRatio: aspect, generateAudio: audio, imageUrl, videoUrl, clipToken, referenceUrls: refs, presetId, modelOptions };
      let storage: Storage | undefined;
      try { storage = window.sessionStorage; } catch { /* In-memory retry ID remains available. */ }
      attempt.current = await generationAttempt(user.id, JSON.stringify(input), attempt.current, storage);
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...input, idempotencyKey: attempt.current.key, maxCredits: cost }),
      });
      const data = await response.json();
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (!response.ok) throw new Error(data.error || "Generation эхлүүлж чадсангүй.");
      setHistory((current) => [data.generation, ...current.filter(item => item.id !== data.generation.id)]);
      setUser((current) => (current ? { ...current, credits: data.credits } : current));
      setMessage(data.generation.warning || data.generation.message || "Хүсэлт бүртгэгдлээ. Доорх бүтээлийн түүхээс төлөвөө шалгана уу.");
      if (data.generation.status !== "PENDING") { clearGenerationAttempt(user.id, storage); attempt.current = null; }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Алдаа гарлаа.");
      await load();
    } finally {
      submitLock.current = false;
      setBusy(false);
    }
  }

  async function cancel(id: string) {
    try {const r=await fetch("/api/generations/"+id,{method:"DELETE"});const d=await r.json();if(!r.ok)throw new Error(d.error||"Цуцалж чадсангүй.");setMessage(d.warning||d.generation?.message||"Хүсэлтийн төлөв шинэчлэгдлээ.");await load();}catch(e){setMessage(e instanceof Error?e.message:"Цуцалж чадсангүй.");}
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
            <span>Видео · Зураг · Засвар</span>
          </div>
          <div className="topActions">
            <span className={"providerDot " + providerHealth}>
              <i />
              {providerHealth === "ready" ? "Холболт тохируулсан" : providerHealth === "checking" ? "Үйлчилгээ шалгаж байна" : "Үйлчилгээ бэлтгэгдэж байна"}
            </span>
            <a href="/billing" className="creditPill"><WalletCards size={15} />{user?.credits ?? 0} кредит</a>
            <button className="ghost" onClick={logout}>Гарах</button>
          </div>
        </header>

        <div className="studioV2">
          <aside className="modelBrowser">
            <div className="browserHeader">
              <b>Загварууд</b>
              <span>{visibleModels.length}</span>
            </div>
            <label className="modelSearch">
              <Search size={14} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Загвар хайх" />
            </label>
            <div className="surfaceTabs">
              {(["all", "video", "image", "workflow"] as const).map((item) => (
                <button key={item} className={surface === item ? "active" : ""} onClick={() => setSurface(item)}>
                  {surfaceLabel(item)}
                </button>
              ))}
            </div>
            <div className="modelList">
              <ModelFamilies items={visibleModels} selected={selected} expand={Boolean(search.trim())} renderModel={(item) => (
                <button
                  key={item.slug}
                  onClick={() => chooseModel(item.slug)}
                  className={"modelItem " + (selected === item.slug ? "active" : "")}
                >
                  <div>
                    <b>{modelVariantLabel(item)}</b>
                    <small>{item.apiVerified ? resolutionLabel(item) : "Параметр нягталж байна"}</small>
                  </div>
                  <span>Тохиргоогоор тооцно</span>
                </button>
              )}/>
              {!visibleModels.length && <div className="browserEmpty">Тохирох загвар олдсонгүй.</div>}
            </div>
          </aside>

          <section className="creativeWorkspace">
            <div className="workspaceTop">
              <div>
                <div className="modelCrumb"><span>{model.group}</span><ChevronRight size={12} /><span>{model.maker || model.provider}</span></div>
                <h1>{model.name}</h1>
                <p>{model.description}</p>
              </div>
              <div className="estimateBadge"><span>Кредитийн тооцоо</span><b>{apiNotReady ? "API бэлэн биш" : clipPending ? "Клип бэлтгэнэ үү" : pricingError ? "Үнэ баталгаажаагүй" : `${cost} кредит`}</b></div>
            </div>

            <div className="composerPanel">
              <div className="composerMode">
                <div><b>{model.name}</b><small>{model.capabilities?.join(" · ")}</small></div>
                <a className="outlineIcon" href="#studio-settings" aria-label="Үүсгэлтийн тохиргоо"><SlidersHorizontal size={15}/></a>
              </div>

              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder={model.requiresPrompt === false
                  ? "Тайлбар нэмэх эсвэл шаардлагатай жишиг материалаа оруул…"
                  : "Гол дүр → үйлдэл → камер → гэрэл → орчин. Санаагаа тодорхой бич…"}
              />

              <div className="quickPromptRow">
                {quickPrompts(model).map((item,index) => (
                  <button key={item} onClick={() => setPrompt((current) => current ? current + ", " + item : item)}>
                    <Sparkles size={12} /> {index===0?"Жишээ тайлбар ашиглах":"Бодит гэрэл, хөдөлгөөн нэмэх"}
                  </button>
                ))}
              </div>

              <div className="referenceStrip">
                {model.supportsImage && (
                  <label className={"referenceSlot " + (imageUrl ? "filled" : "")}>
                    <ImagePlus size={17} />
                    <span>{imageUrl ? "Эх зураг бэлэн" : "Эх зураг"}</span>
                    <input
                      type="file"
                      disabled={uploading || providerHealth!=="ready"}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "image").catch((error) => setMessage(error.message))}
                    />
                  </label>
                )}
                {model.supportsVideo && !clipGenjutsu && (
                  <label className={"referenceSlot " + (videoUrl ? "filled" : "")}>
                    <Video size={17} />
                    <span>{videoUrl ? "Эх видео бэлэн" : "Эх видео"}</span>
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
                    <span>Жишиг зураг {refs.length}/{model.maxReferences || 16}</span>
                    <input
                      type="file"
                      disabled={uploading || providerHealth!=="ready"}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "ref").catch((error) => setMessage(error.message))}
                    />
                  </label>
                )}
                {!model.supportsImage && !model.supportsVideo && !model.supportsMultipleReferences && (
                  <div className="referenceHint"><WandSparkles size={16} /> Тайлбараас бүтээх загвар</div>
                )}
              </div>

              {clipGenjutsu && model.apiVerified &&(
                <YouTubeGenjutsuSource
                  onPrepared={(url,seconds,proof)=>{setVideoUrl(url);setClipSeconds(seconds);setClipToken(proof);setMessage("Genjutsu эх видео бэлэн.");}}
                  onSourceChange={()=>{setVideoUrl("");setClipToken("");setClipSeconds(null);}}
                  onProcessing={setUploading}
                />
              )}
              {clipGenjutsu && videoUrl && !clipToken && <p className="serviceState" role="status">Энэ эх видео Genjutsu-д бэлэн болоогүй. Эх MP4-гээ дээрх хэсгээр тайрч хугацааг серверээр баталгаажуулна уу.</p>}
              {model.slug==="genjutsu-object" && !model.apiVerified && <div className="accountNotice"><WandSparkles size={18}/><div>Object Swap API-ийн параметрүүд хараахан баталгаажаагүй тул энэ загварын үүсгэлт түр хаалттай. <Link href="/studio?model=genjutsu-motion&source=youtube">Genjutsu Motion Transfer руу шилжих →</Link></div></div>}
              {presetError&&<p className="serviceState" role="status">{presetError}</p>}
              <div className="inputPreview">{[imageUrl,...refs].filter(Boolean).map((url,index)=><div key={url+index}><img src={url} alt={`Жишиг зураг ${index+1}`}/><button aria-label="Жишиг зураг хасах" onClick={()=>imageUrl===url?setImageUrl(""):setRefs(current=>current.filter(value=>value!==url))}><X size={12}/></button></div>)}{videoUrl&&<button className="ghost" onClick={()=>{setVideoUrl("");setClipToken("");setClipSeconds(null);}}><Video size={14}/> Жишиг видео хасах</button>}</div>
              {presets.length > 0 && (
                <select className="fullSelect" value={presetId} onChange={(event) => setPresetId(event.target.value)}>
                  <option value="">{model.slug === "genjutsu-restyle"?"Видео хэв маяг сонгох":"Зарын хэв маяг · сайжруулалтын горимд"}</option>
                  {presets.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                </select>
              )}

              {apiNotReady&&<p className="serviceState" role="status">{model.name} одоогоор баталгаажсан API холболтгүй тул үүсгэлт хаалттай. Кредит зарцуулахгүй. {model.group==="Genjutsu"&&<Link href="/studio?model=genjutsu-motion&source=youtube">Genjutsu Motion Transfer сонгох →</Link>}</p>}
              <details className="modelExtraSettings"><summary>Нэмэлт тохиргоо</summary><div className="modelApiFields">{(model.parameters||[]).filter(f=>!["prompt","duration","resolution","aspect_ratio","image_url","video_url","image_urls","video_urls","reference_urls","first_frame_url","start_image_url","generate_audio","sound","keep_original_sound","preset_id"].includes(f.name)).map(f=><label key={f.name}><span>{parameterLabel(f.name)}{f.required?" *":""}</span><small>{parameterHelp(f)}</small>{f.options?<select value={String(modelOptions[f.name]??f.default??"")} onChange={e=>setModelOptions(o=>({...o,[f.name]:e.target.value===""?undefined:/integer|number/.test(f.type)?Number(e.target.value):e.target.value}))}>{f.default===undefined&&<option value="">Үндсэн горим</option>}{f.options.map(v=><option value={v} key={v}>{optionLabel(v)}</option>)}</select>:f.type.includes("boolean")?<input type="checkbox" checked={Boolean(modelOptions[f.name]??f.default)} onChange={e=>setModelOptions(o=>({...o,[f.name]:e.target.checked}))}/>:f.type.includes("array")||f.type.includes("object")?<textarea placeholder={f.type.includes("object")?"{}":"[]"} aria-label={parameterLabel(f.name)} onChange={e=>{try{const value=JSON.parse(e.target.value||"null");setModelOptions(o=>({...o,[f.name]:value}));}catch{setModelOptions(o=>({...o,[f.name]:e.target.value}));}}}/>:<input type={/integer|number/.test(f.type)?"number":"text"} min={f.minimum} max={f.maximum} maxLength={f.maxLength} value={String(modelOptions[f.name]??f.default??"")} onChange={e=>setModelOptions(o=>({...o,[f.name]:e.target.value===""?undefined:/integer|number/.test(f.type)?Number(e.target.value):e.target.value}))}/>}</label> )}</div></details>
              <div className="composerBottom">
                <div className="inlineSettings" id="studio-settings">
                  {model.minDuration && model.maxDuration && (
                    <label>
                      <span>Хугацаа</span>
                      <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                        {(model.durationOptions||Array.from({ length: model.maxDuration - model.minDuration + 1 }, (_, index) => model.minDuration! + index))
                          .map((value) => <option value={value} key={value}>{value} сек</option>)}
                      </select>
                    </label>
                  )}
                  {model.parameters?.some(f=>f.name==="resolution")&&<label>
                    <span>Нягтаршил</span>
                    <select value={resolution} onChange={(event) => setResolution(event.target.value)}>
                      {model.resolutions.map((item) => <option value={item} key={item}>{optionLabel(item)}</option>)}
                    </select>
                  </label>}
                  {model.parameters?.some(f=>f.name==="aspect_ratio")&&<label>
                    <span>Кадрын харьцаа</span>
                    <select value={aspect} onChange={(event) => setAspect(event.target.value)}>
                      {model.aspectRatios.map((item) => <option value={item} key={item}>{optionLabel(item)}</option>)}
                    </select>
                  </label>}
                  {model.supportsAudio && (
                    <label className="audioToggle">
                      <span>Дуу</span>
                      <input type="checkbox" checked={audio} onChange={(event) => setAudio(event.target.checked)} />
                    </label>
                  )}
                </div>

                <button className="generateButton" disabled={!canSubmit} onClick={submit}>
                  {busy ? <LoaderCircle className="spin" size={17} /> : <ArrowUp size={17} />}
                  <span>{busy ? "Илгээж байна" : "Үүсгэх"}</span>
                  <b>{apiNotReady ? "API баталгаажаагүй" : clipPending ? "Клип шаардлагатай" : pricingError ? "Үнэ баталгаажаагүй" : `${cost} кредит`}</b>
                </button>
              </div>

              {!pricingError && cost>0 && <p className="serviceState">{model.kind === "video" ? (cost<=300 ? "Хэмнэлттэй" : cost<=800 ? "Стандарт" : "Премиум") : "Зураг / Workflow"} · Нэг бүтээл {cost.toLocaleString()} кредит{user ? ` · Үлдэгдлээр ${Math.floor(user.credits/cost)} бүтээл` : ""}. Үнэ сонгосон тохиргооноос хамаарна.</p>}
              {model.kind === "video" && cost>800 && <p className="serviceState">Хэмнэх бол <Link href={`/studio?model=${models.find(m=>m.modelId==="minimax/hailuo-2.3/standard/text-to-video")?.slug || ""}`}>Hailuo 2.3 · 6 секунд →</Link></p>}
              {inputError&&hasInput&&<p className="serviceState">{inputError}</p>}
              {providerHealth==="missing"&&<div className="accountNotice"><Sparkles size={20}/><div>Үүсгэх үйлчилгээ бэлтгэгдэж байна. Одоогоор жишээ үзэж, санаа болон тохиргоогоо бэлдээрэй. <Link href="/video-guide">Гарын авлага үзэх →</Link></div></div>}
              {pricingError&&<p className="serviceState" role="alert">{pricingError} {model.group==="Genjutsu" && <Link href="/studio?model=genjutsu-motion&source=youtube">Motion Transfer сонгох →</Link>}</p>}
              {user&&user.credits<cost&&<p className="serviceState">Энэ бүтээлд {cost} кредит хэрэгтэй. Таны үлдэгдэл {user.credits}. <Link href="/billing">Кредитийн багц үзэх →</Link></p>}
              {message && <div className={"studioMessage " + (message.includes("алдаа") || message.includes("дутуу") ? "error" : "")}>{message}</div>}
            </div>

            <ModelGuide model={model} compact/>
            <section className="modelInfoStrip">
              <div><small>ОРОЛТ</small><b>{model.supportsVideo ? "Видео + " : ""}{model.supportsImage || model.supportsMultipleReferences ? "Зураг + " : ""}Тайлбар</b></div>
              <div><small>ГАРАЛТ</small><b>{model.kind === "image" ? "Зураг" : "Видео"}</b></div>
              <div><small>ХЭМЖЭЭ</small><b>{resolutionLabel(model)}</b></div>
              <div><small>БҮТЭЭЛҮҮД</small><b>Хувийн түүх</b></div>
            </section>

            <ModelExamples model={model} onUsePrompt={setPrompt} />
            <section id="generations" className="generationSection">
              <div className="historyHead">
                <div><small>GENERATIONS</small><h2>Миний бүтээлүүд</h2></div>
                <button className="ghost" onClick={load}><RefreshCw size={14} /> Шинэчлэх</button>
              </div>

              <div className="generationMasonry">
                {history.map((item) => {
                  const media = item.status === "COMPLETED" ? item.media : null;
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
                        <div><b>{itemModel?.name || item.modelSlug}</b><span>{item.costCredits} кредит</span></div>
                        <p>{item.prompt || "Жишиг файлаар бүтээсэн"}</p>
                        {item.warning && <p className="formError" role="status">{item.warning}</p>}
                        {item.status==="FAILED"&&<p className="generationError">Үүсгэлт амжилтгүй боллоо. {item.refunded ? "Кредитийн буцаалт бүртгэгдсэн." : "Кредитийн буцаалтыг шалгаж байна."}</p>}
                        {item.status==="COMPLETED"&&!media&&<p className="generationError">Үр дүнгийн холбоос олдсонгүй. Дахин шинэчилж шалгана уу.</p>}
                        <small>{new Date(item.createdAt).toLocaleString("mn-MN")}</small>
                        <div className="generationFooter">
                          {item.status === "SUBMITTED" && <button onClick={() => cancel(item.id)}><X size={12} /> Цуцлах</button>}
                          {item.refunded && <span className="refund"><CheckCircle2 size={12} /> Кредитийн буцаалт бүртгэгдсэн</span>}
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
              <h3>{model.name}</h3>
              <p>{model.description}</p>
              <div className="contextTags">{model.capabilities?.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
            <div className="contextCard">
              <small>CHECKLIST</small>
              <ul className="checkList">
                <li className={hasInput ? "done" : ""}><i /> Тайлбар эсвэл жишиг</li>
                <li className={user && user.credits >= cost ? "done" : ""}><i /> {cost} кредит</li>
                <li className={providerHealth === "ready" ? "done" : ""}><i /> Үүсгэх үйлчилгээ</li>
              </ul>
            </div>
            <div className="contextCard helperCard">
              <WandSparkles size={18} />
              <b>Тайлбар бичих зөвлөгөө</b>
              <p>Дүр → үйлдэл → камер → гэрэл → орчин → хэв маяг гэсэн дарааллаар тайлбарла. Qwen-д Англи эсвэл Хятад тайлбар зөвлөсөн.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

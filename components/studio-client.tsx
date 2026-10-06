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
import { Sidebar } from "@/components/sidebar";
import { CommunityInspiration } from "@/components/community-inspiration";
import { estimateCredits, getModel, models, type ModelKind, type RavsModel } from "@/lib/models";

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

function mediaFrom(output: unknown) {
  if (!output || typeof output !== "object") return null;
  const value = output as Record<string, unknown>;
  const video = value.video;
  if (video && typeof video === "object" && typeof (video as Record<string, unknown>).url === "string") {
    return { type: "video" as const, url: (video as Record<string, string>).url };
  }
  const images = value.images;
  if (Array.isArray(images) && images[0] && typeof images[0] === "object" && typeof (images[0] as Record<string, unknown>).url === "string") {
    return { type: "image" as const, url: (images[0] as Record<string, string>).url };
  }
  if (typeof value.url === "string") return { type: "video" as const, url: value.url };
  return null;
}

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
  const initialApplied = useRef(false);

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
    if (initialApplied.current) return;
    initialApplied.current = true;
    const queryModel = params.get("model");
    const querySurface = params.get("surface");
    const queryPrompt = params.get("prompt");
    if (queryModel && getModel(queryModel)) setSelected(queryModel);
    else if (group) {
      const first = models.find((item) => item.group === group);
      if (first) setSelected(first.slug);
    }
    if (querySurface === "video" || querySurface === "image" || querySurface === "workflow") setSurface(querySurface);
    if (queryPrompt) setPrompt(queryPrompt);
  }, [group, params]);

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
    setMessage("");
    if (model.slug === "genjutsu-restyle") {
      fetch("/api/catalog/presets?kind=restyle")
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => setPresets(Array.isArray(data?.items) ? data.items : []))
        .catch(() => null);
    }
  }, [selected, params]);

  async function load() {
    const me = await fetch("/api/auth/me", { cache: "no-store" });
    const meData = await me.json();
    if (!meData.user) {
      router.push("/login");
      return;
    }
    setUser(meData.user);

    const response = await fetch("/api/generations", { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setHistory(data.generations || []);
      setUser((current) => (current ? { ...current, credits: data.user?.credits ?? current.credits } : current));
    }
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
    const timer = window.setInterval(async () => {
      for (const item of active) {
        const response = await fetch("/api/generations/" + item.id, { cache: "no-store" });
        if (!response.ok) continue;
        const data = await response.json();
        setHistory((current) => current.map((entry) => (entry.id === item.id ? data.generation : entry)));
        if (data.credits !== undefined) {
          setUser((current) => (current ? { ...current, credits: data.credits } : current));
        }
      }
    }, 4500);
    return () => window.clearInterval(timer);
  }, [history.map((item) => item.id + item.status).join("|")]);

  async function upload(file: File, kind: "image" | "video" | "ref") {
    setMessage("Reference байршуулж байна…");
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
    if (kind === "image") setImageUrl(publicUrl);
    else if (kind === "video") setVideoUrl(publicUrl);
    else {
      const max = model.maxReferences || 16;
      setRefs((current) => [...current, publicUrl].slice(0, max));
    }
    setMessage("Reference бэлэн.");
  }

  const hasInput = Boolean(prompt.trim() || imageUrl || videoUrl || refs.length);
  const canSubmit = !busy && hasInput;

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
    await fetch("/api/generations/" + id, { method: "DELETE" });
    await load();
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
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
              {providerHealth === "ready" ? "Higgsfield API" : providerHealth === "checking" ? "API шалгаж байна" : "API key дутуу"}
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
                  <div className={"modelGlyph tone-" + (item.tone || "violet")}>{item.name.slice(0, 1)}</div>
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
                <span className={"modelGlyph tiny tone-" + (model.tone || "violet")}>{model.name.slice(0, 1)}</span>
                <div><b>{model.name}</b><small>{model.capabilities?.join(" · ")}</small></div>
                <button className="outlineIcon"><SlidersHorizontal size={15} /></button>
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
                      accept="video/mp4,video/quicktime"
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
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => event.target.files?.[0] && upload(event.target.files[0], "ref").catch((error) => setMessage(error.message))}
                    />
                  </label>
                )}
                {!model.supportsImage && !model.supportsVideo && !model.supportsMultipleReferences && (
                  <div className="referenceHint"><WandSparkles size={16} /> Prompt-only model</div>
                )}
              </div>

              {presets.length > 0 && (
                <select className="fullSelect" value={presetId} onChange={(event) => setPresetId(event.target.value)}>
                  <option value="">Restyle preset сонгох</option>
                  {presets.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
                </select>
              )}

              <div className="composerBottom">
                <div className="inlineSettings">
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

              {message && <div className={"studioMessage " + (message.includes("алдаа") || message.includes("дутуу") ? "error" : "")}>{message}</div>}
            </div>

            <section className="modelInfoStrip">
              <div><small>INPUT</small><b>{model.supportsVideo ? "Video + " : ""}{model.supportsImage || model.supportsMultipleReferences ? "Reference + " : ""}Prompt</b></div>
              <div><small>OUTPUT</small><b>{model.kind === "image" ? "Image" : "Video"}</b></div>
              <div><small>RESOLUTION</small><b>{model.resolutions.join(" · ")}</b></div>
              <div><small>API</small><b>Server-side</b></div>
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
                          <video src={media.url} controls preload="metadata" playsInline />
                        ) : media?.type === "image" ? (
                          <img src={media.url} alt="RAVS generated result" />
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
                        <p>{item.prompt || "Reference workflow"}</p>
                        <small>{new Date(item.createdAt).toLocaleString("mn-MN")}</small>
                        <div className="generationFooter">
                          {active && <button onClick={() => cancel(item.id)}><X size={12} /> Цуцлах</button>}
                          {item.refunded && <span className="refund"><CheckCircle2 size={12} /> Credit буцаасан</span>}
                        </div>
                      </div>
                    </article>
                  );
                })}
                {!history.length && (
                  <div className="screenEmpty">
                    <div className="emptyVisual"><div /><div /><div /></div>
                    <Sparkles size={20} />
                    <h3>Эхний бүтээлээ үүсгээрэй</h3>
                    <p>Дээр prompt эсвэл reference оруулаад Generate дарна. Бүх result энд хадгалагдана.</p>
                  </div>
                )}
              </div>
            </section>
          </section>

          <aside className="contextRail">
            <div className="contextCard">
              <small>MODEL</small>
              <div className={"contextModel tone-" + (model.tone || "violet")}>{model.name.slice(0, 1)}</div>
              <h3>{model.name}</h3>
              <p>{model.description}</p>
              <div className="contextTags">{model.capabilities?.map((item) => <span key={item}>{item}</span>)}</div>
            </div>
            <div className="contextCard">
              <small>CHECKLIST</small>
              <ul className="checkList">
                <li className={hasInput ? "done" : ""}><i /> Prompt эсвэл reference</li>
                <li className={user && user.credits >= cost ? "done" : ""}><i /> {cost} credit</li>
                <li className={providerHealth === "ready" ? "done" : ""}><i /> Higgsfield API</li>
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

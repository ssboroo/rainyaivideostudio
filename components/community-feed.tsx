"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, LoaderCircle, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { communityFeed, communityFeedHref, type CommunityFeedItem, type CommunityFeedTab } from "@/lib/community-feed";

type MediaMeta = { video?: string | null; image?: string | null };

const tabs: Array<{ id: CommunityFeedTab; label: string }> = [
  { id: "higgsfield", label: "Higgsfield жишээ" },
  { id: "trending", label: "Олны сонирхсон" },
  { id: "new", label: "Шинэ санаанууд" },
];

function FeedCard({ item }: { item: CommunityFeedItem }) {
  const [meta, setMeta] = useState<MediaMeta>({video:item.previewSrc,image:item.poster});
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [imageFailed,setImageFailed]=useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if(item.previewSrc){setMeta({video:item.previewSrc,image:item.poster});setLoading(false);return;}
    let alive = true;
    setLoading(true);
    fetch("/api/community/meta?url=" + encodeURIComponent(item.sourceHref))
      .then((response) => response.ok ? response.json() : null)
      .then((value) => {
        if (!alive || !value) return;
        setMeta({ video: value.video || null, image: value.image || null });
      })
      .catch(() => null)
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [item.sourceHref,item.previewSrc,item.poster]);

  async function togglePlay() {
    const video = videoRef.current;
    if (!video || !meta.video || failed) return;
    if (video.paused) {
      try { await video.play(); } catch {}
    } else {
      video.pause();
    }
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  }

  const playable = Boolean(meta.video && !failed);

  return (
    <article className="communityMasonryCard">
      <div className="communityMasonryMedia" style={{ aspectRatio: item.ratio }}>
        {playable ? (
          <video
            ref={videoRef}
            src={meta.video || undefined}
            poster={meta.image || undefined}
            preload="metadata"
            playsInline
            muted={muted}
            loop
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
          />
        ) : meta.image && !imageFailed ? (
          <img src={meta.image} alt={item.title} loading="lazy" onError={()=>setImageFailed(true)} />
        ) : (
          <div className="communityMasonryFallback">
            {loading ? <LoaderCircle size={20} className="spin" /> : <Play size={20} />}
            <span>{loading ? "Demo уншиж байна" : item.title}</span>
          </div>
        )}

        <div className="communityMasonryShade" />
        <div className="communityMasonryTop">
          <span>{item.badge}</span>
          
        </div>

        {playable && <button
          className={"communityCenterPlay " + (!playable ? "disabled" : "")}
          type="button"
          onClick={togglePlay}
          disabled={!playable}
          aria-label={playable ? (playing ? "Pause video" : "Play video") : "Demo unavailable"}
        >
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>}

        {playable && (
          <button className="communityMute" type="button" onClick={toggleMute} aria-label={muted ? "Unmute video" : "Mute video"}>
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        )}

        <div className="communityMasonryInfo">
          <small>{item.creator}</small>
          <h3>{item.title}</h3>
          <details className="communityPrompt"><summary>Жишиг тайлбар</summary><p>{item.prompt}</p></details><div className="communityMasonryActions">
            <Link href={communityFeedHref(item)} className="communityRecreate">
              <RotateCcw size={11} /> Шинээр бүтээх
            </Link>
            {!playable && !loading && <a className="demoUnavailable" href={item.sourceHref} target="_blank" rel="noreferrer">Эх сурвалж ↗</a>}
          </div>
        </div>
      </div>
    </article>
  );
}

export function CommunityFeed() {
  const [active, setActive] = useState<CommunityFeedTab | "all">("all");
  const [search,setSearch]=useState("");
  const items = useMemo(() => communityFeed.filter((item) => (active==="all"||item.tab === active)&&[item.title,item.creator,item.badge,item.prompt].join(" ").toLowerCase().includes(search.trim().toLowerCase())), [active,search]);

  return (
    <section className="communityFeed">
      <div className="communityFeedTabs" role="tablist" aria-label="Community feed">
        {[{id:"all",label:"Бүх бүтээл"},...tabs].map((tab) => (
          <button
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={active === tab.id ? "active" : ""}
            onClick={() => setActive(tab.id as CommunityFeedTab | "all")}
            key={tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="communityFeedIntro">
        <div>
          <small>ҮЗ · САНАА АВ · БҮТЭЭ</small>
          <h2>{active==="all"?"Санаа авах бүтээлүүд":tabs.find((tab) => tab.id === active)?.label}</h2>
        </div>
        <p>Эффект, дүр хувиргалт, киноны жишээг судлаарай. Жишгийн тайлбарыг Studio-д нээж өөрийн эх материалтай шинэ бүтээл эхлүүлнэ.</p>
      </div>

      <div className="videoLibraryToolbar"><input aria-label="Бүтээл хайх" placeholder="Бүтээл, эффект, зохиогч хайх…" value={search} onChange={e=>setSearch(e.target.value)}/><span>{items.length} / {communityFeed.length} жишээ</span><Link href="/video-guide">Алхамчилсан заавар ↗</Link></div>{items.length===0&&<p className="videoLibraryEmpty">Тохирох бүтээл олдсонгүй. <button onClick={()=>{setSearch("");setActive("all");}}>Бүх бүтээлийг харах</button></p>}<div className="communityMasonry">
        {items.map((item) => <FeedCard item={item} key={item.id} />)}
      </div>
    </section>
  );
}

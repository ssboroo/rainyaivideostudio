"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Eye, Film, Pause, Play, RotateCcw, ShieldCheck, Volume2, VolumeX } from "lucide-react";
import {
  communityFor,
  recreateHref,
  type CommunityItem,
  type CommunitySurface,
} from "@/lib/community-inspiration";

type Meta = { video?: string | null; image?: string | null };

function Card({ item }: { item: CommunityItem }) {
  const [meta, setMeta] = useState<Meta>({});
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const [imageFailed,setImageFailed]=useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/community/meta?url=" + encodeURIComponent(item.sourceHref))
      .then((response) => response.ok ? response.json() : null)
      .then((value) => {
        if (alive && value) setMeta({ video: value.video || null, image: value.image || null });
      })
      .catch(() => null);
    return () => { alive = false; };
  }, [item.sourceHref]);

  const playable = Boolean(meta.video && !failed);

  async function togglePlay() {
    if (!playable || !videoRef.current) return;
    if (videoRef.current.paused) {
      try { await videoRef.current.play(); } catch {}
    } else {
      videoRef.current.pause();
    }
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  }

  return (
    <article className="communityCard">
      <div className="communityMedia">
        {playable ? (
          <video
            ref={videoRef}
            className="communityVideo"
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
          <img className="communityPoster" src={meta.image} alt={item.title + " preview"} loading="lazy" onError={()=>setImageFailed(true)} />
        ) : (
          <div className={"communityFallback tone-" + item.tone}>
            <Film size={24} />
            <span>{item.title}</span><small>Өөрийн хувилбарын санаа</small>
          </div>
        )}
        <div className="communityShade" />
        <span className="communityBadge">{item.badge}</span>
        {playable && <button aria-label={playing?"Видео зогсоох":"Видео тоглуулах"} className={"communityPlay " + (!playable ? "disabled" : "")} type="button" disabled={!playable} onClick={togglePlay}>
          {playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
        </button>}
        {playable && (
          <button aria-label={muted?"Дуу нээх":"Дуу хаах"} className="communityInlineMute" type="button" onClick={toggleMute}>
            {muted ? <VolumeX size={11} /> : <Volume2 size={11} />}
          </button>
        )}
        {item.views && <span className="communityViews"><Eye size={11} /> {item.views}</span>}
      </div>
      <div className="communityBody">
        <div><small>{item.creator}</small><h3>{item.title}</h3></div>
        <p>{item.description}</p>
        {item.note && <div className="communityNote"><ShieldCheck size={11} /> {item.note}</div>}
        <div className="communityActions">
          {item.recreate ? (
            <Link className="primary" href={recreateHref(item)}>
              <RotateCcw size={11} /> Өөрийн хувилбарыг бүтээ
            </Link>
          ) : (
            <span className="studyOnly">Санаа авах</span>
          )}
          {!playable && <a className="demoUnavailable" href={item.sourceHref} target="_blank" rel="noreferrer">Эх сурвалж үзэх ↗</a>}
        </div>
      </div>
    </article>
  );
}

export function CommunityInspiration({
  surface,
  limit = 4,
  title = "Community-аас санаа аваарай",
}: {
  surface: CommunitySurface;
  limit?: number;
  title?: string;
}) {
  const items = useMemo(() => communityFor(surface, limit), [surface, limit]);

  return (
    <section className="communitySection">
      <div className="communitySectionHead">
        <div>
          <small>COMMUNITY · TREND · ORIGINALS</small>
          <h2>{title}</h2>
          <p>Жишээг үзээд өөрийн дүр, орчин, тайлбартай шинэ бүтээлээ эхлүүлээрэй.</p>
        </div>
        <Link href="/community" className="ghost">Community бүгд <ArrowRight size={13} /></Link>
      </div>
      <div className="communityGrid">{items.map((item) => <Card item={item} key={item.id} />)}</div>
    </section>
  );
}

export function CommunityAll() {
  const items = (["home","video","cinema","marketing","influencer","apps"] as CommunitySurface[])
    .flatMap((surface) => communityFor(surface, 8))
    .filter((item, index, all) => all.findIndex((entry) => entry.id === item.id) === index);
  return <section className="communitySection communityAll"><div className="communityGrid">{items.map((item) => <Card item={item} key={item.id} />)}</div></section>;
}

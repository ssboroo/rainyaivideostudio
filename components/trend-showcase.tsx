"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play, TrendingUp, Volume2, VolumeX } from "lucide-react";
import { trendDemos } from "@/lib/trend-demos";

function TrendMedia({ item }: { item: (typeof trendDemos)[number] }) {
  const [video, setVideo] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/community/meta?url=" + encodeURIComponent(item.official))
      .then((response) => response.ok ? response.json() : null)
      .then((value) => {
        if (alive && value?.video) setVideo(value.video);
      })
      .catch(() => null);
    return () => { alive = false; };
  }, [item.official]);

  async function toggle() {
    if (!ref.current || !video || failed) return;
    if (ref.current.paused) {
      try { await ref.current.play(); } catch {}
    } else ref.current.pause();
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (ref.current) ref.current.muted = next;
  }

  return (
    <div className="trendMedia">
      {video && !failed ? (
        <video
          ref={ref}
          src={video}
          poster={item.poster}
          preload="metadata"
          muted={muted}
          loop
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      ) : (
        <img src={item.poster} alt={item.title + " preview"} loading="lazy" />
      )}
      <div className="trendOverlay" />
      <span className="trendBadge">{item.badge}</span>
      <button className={"trendPlay " + (!video || failed ? "disabled" : "")} type="button" disabled={!video || failed} onClick={toggle}>
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
      </button>
      {video && !failed && (
        <button className="trendMute" type="button" onClick={toggleMute}>
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
      )}
      <span className="trendDemoLabel">{video && !failed ? "Энд тоглуулна" : "Demo unavailable"}</span>
    </div>
  );
}

export function TrendShowcase({ compact = false }: { compact?: boolean }) {
  const items = compact ? trendDemos.slice(0, 4) : trendDemos;

  return (
    <section className={compact ? "productSection trendSection" : "catalogPage trendPage"}>
      <div className="sectionTitleRow">
        <div>
          <small>HIGGSFIELD VIRAL · TRENDING</small>
          <h2>{compact ? "Одоо тренд болж буй video effects" : "Higgsfield trend demo-ууд"}</h2>
          <p>Public playable demo байвал card дотроо шууд тоглоно. External page нээгдэхгүй.</p>
        </div>
        {compact && <Link href="/trends">Бүгдийг харах <ArrowRight size={15} /></Link>}
      </div>

      <div className={compact ? "trendGrid compact" : "trendGrid"}>
        {items.map((item) => (
          <article className="trendCard" key={item.id}>
            <TrendMedia item={item} />
            <div className="trendBody">
              <div className="trendTitle">
                <div><small>VIRAL PRESET</small><h3>{item.title}</h3></div>
                <TrendingUp size={15} />
              </div>
              <p>{item.description}</p>
              <div className="trendUse"><b>Юунд тохирох вэ?</b><span>{item.use}</span></div>
              <div className="trendActions">
                <Link className="primary" href="/apps">RAVS workflow <ArrowRight size={12} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!compact && (
        <div className="trendDisclaimer">
          <b>Demo playback зөвхөн RAVS дотор.</b>
          <p>Media-г өөрийн серверт хуулж хадгалахгүй; public media URL байвал stream хийнэ. External official page руу redirect хийхгүй.</p>
        </div>
      )}
    </section>
  );
}

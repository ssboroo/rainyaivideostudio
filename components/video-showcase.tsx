"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Pause, Play, Sparkles, Volume2, VolumeX } from "lucide-react";
import { videoShowcases, type VideoShowcaseItem } from "@/lib/video-showcase";

function Preview({ item }: { item: VideoShowcaseItem }) {
  const [remoteVideo, setRemoteVideo] = useState<string | null>(item.previewSrc || null);
  const [poster, setPoster] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/community/meta?url=" + encodeURIComponent(item.officialHref))
      .then((response) => response.ok ? response.json() : null)
      .then((value) => {
        if (!alive || !value) return;
        if (!item.previewSrc && value.video) setRemoteVideo(value.video);
        if (value.image) setPoster(value.image);
      })
      .catch(() => null);
    return () => { alive = false; };
  }, [item.officialHref, item.previewSrc]);

  async function toggle() {
    if (!ref.current || !remoteVideo || failed) return;
    if (ref.current.paused) {
      try { await ref.current.play(); } catch {}
    } else ref.current.pause();
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    if (ref.current) ref.current.muted = next;
  }

  if (remoteVideo && !failed) {
    return (
      <>
        <video
          ref={ref}
          className="showcaseVideo"
          src={remoteVideo}
          poster={poster || undefined}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
        <button type="button" className="showcasePlayButton" onClick={toggle} aria-label={playing ? "Pause demo" : "Play demo"}>
          {playing ? <Pause size={17} fill="currentColor" /> : <Play size={17} fill="currentColor" />}
        </button>
        <button type="button" className="showcaseMuteButton" onClick={toggleMute} aria-label={muted ? "Unmute demo" : "Mute demo"}>
          {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
        </button>
      </>
    );
  }

  return (
    <div className={"showcaseFallback accent-" + item.accent} aria-label={item.title + " preview"}>
      {poster && <img className="showcasePoster" src={poster} alt="" />}
      <div className="showcaseNoise" />
      <div className="showcaseOrb showcaseOrbA" />
      <div className="showcaseOrb showcaseOrbB" />
      <div className="showcaseScan" />
      <div className="showcasePlay disabled"><Play size={18} fill="currentColor" /></div>
      <span>DEMO UNAVAILABLE</span>
    </div>
  );
}

export function VideoShowcase({ compact = false }: { compact?: boolean }) {
  const items = compact ? videoShowcases.slice(0, 4) : videoShowcases;

  return (
    <section className={compact ? "productSection videoShowcaseSection" : "catalogPage videoGuidePage"}>
      <div className="sectionTitleRow">
        <div>
          <small>VIDEO SHOWCASE</small>
          <h2>{compact ? "Видео боломжуудыг жишээгээр ойлго" : "Ямар видео хэрэгсэл юунд тохирох вэ?"}</h2>
          <p>Demo-г RAVS дотор шууд тоглуулаад тухайн model/workflow-оор эхэл.</p>
        </div>
        {compact && <Link href="/video-guide">Бүгдийг харах <ArrowRight size={15} /></Link>}
      </div>

      <div className={compact ? "videoShowcaseGrid compact" : "videoShowcaseGrid"}>
        {items.map((item) => (
          <article className="videoShowcaseCard" key={item.id}>
            <div className="showcaseMedia">
              <Preview item={item} />
              <div className="showcaseBadge">{item.subtitle}</div>
            </div>
            <div className="showcaseBody">
              <div className="showcaseTitleRow">
                <div><small>VIDEO WORKFLOW</small><h3>{item.title}</h3></div>
                <Sparkles size={16} />
              </div>
              <p>{item.description}</p>
              <div className="showcaseUse"><b>Юунд ашиглах вэ?</b><div>{item.useCases.map((value) => <span key={value}>{value}</span>)}</div></div>
              <div className="showcaseCapabilities">{item.capabilities.map((value) => <span key={value}>{value}</span>)}</div>
              <div className="showcaseActions">
                <Link className="primary" href={item.studioHref}>RAVS дээр нээх <ArrowRight size={14} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!compact && (
        <div className="showcaseNote">
          <div>
            <small>IN-PAGE DEMO</small>
            <b>Demo тоглуулахад RAVS-ээс гарахгүй.</b>
            <p>Public playable media олдвол шууд stream хийнэ. Олдохгүй card external page руу үсрэхгүй, зөвхөн workflow нээх боломжтой байна.</p>
          </div>
          <Link href="/studio" className="primary">Өөрийн demo үүсгэх <ArrowRight size={14} /></Link>
        </div>
      )}
    </section>
  );
}

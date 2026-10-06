"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Eye, LoaderCircle, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { communityFeed, communityFeedHref, type CommunityFeedItem, type CommunityFeedTab } from "@/lib/community-feed";

type MediaMeta = { video?: string | null; image?: string | null };

const tabs: Array<{ id: CommunityFeedTab; label: string }> = [
  { id: "higgsfield", label: "By Higgsfield" },
  { id: "trending", label: "Community Trending" },
  { id: "new", label: "Community New" },
];

function FeedCard({ item }: { item: CommunityFeedItem }) {
  const [meta, setMeta] = useState<MediaMeta>({});
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
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
  }, [item.sourceHref]);

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
        ) : meta.image ? (
          <img src={meta.image} alt={item.title} loading="lazy" />
        ) : (
          <div className="communityMasonryFallback">
            {loading ? <LoaderCircle size={20} className="spin" /> : <Play size={20} />}
            <span>{loading ? "Demo уншиж байна" : "Playable demo олдсонгүй"}</span>
          </div>
        )}

        <div className="communityMasonryShade" />
        <div className="communityMasonryTop">
          <span>{item.badge}</span>
          {item.views && <span><Eye size={10} /> {item.views}</span>}
        </div>

        <button
          className={"communityCenterPlay " + (!playable ? "disabled" : "")}
          type="button"
          onClick={togglePlay}
          disabled={!playable}
          aria-label={playable ? (playing ? "Pause video" : "Play video") : "Demo unavailable"}
        >
          {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
        </button>

        {playable && (
          <button className="communityMute" type="button" onClick={toggleMute} aria-label={muted ? "Unmute video" : "Mute video"}>
            {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        )}

        <div className="communityMasonryInfo">
          <small>{item.creator}</small>
          <h3>{item.title}</h3>
          <div className="communityMasonryActions">
            <Link href={communityFeedHref(item)} className="communityRecreate">
              <RotateCcw size={11} /> Recreate
            </Link>
            {!playable && !loading && <span className="demoUnavailable">Demo unavailable</span>}
          </div>
        </div>
      </div>
    </article>
  );
}

export function CommunityFeed() {
  const [active, setActive] = useState<CommunityFeedTab>("higgsfield");
  const items = useMemo(() => communityFeed.filter((item) => item.tab === active), [active]);

  return (
    <section className="communityFeed">
      <div className="communityFeedTabs" role="tablist" aria-label="Community feed">
        {tabs.map((tab) => (
          <button
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            className={active === tab.id ? "active" : ""}
            onClick={() => setActive(tab.id)}
            key={tab.id}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="communityFeedIntro">
        <div>
          <small>PLAY · EXPLORE · RECREATE</small>
          <h2>{tabs.find((tab) => tab.id === active)?.label}</h2>
        </div>
        <p>Official page руу шилжихгүй. Demo боломжтой card-уудыг эндээс шууд тоглуулаад Recreate дарж Studio-д үргэлжлүүл.</p>
      </div>

      <div className="communityMasonry">
        {items.map((item) => <FeedCard item={item} key={item.id} />)}
      </div>
    </section>
  );
}

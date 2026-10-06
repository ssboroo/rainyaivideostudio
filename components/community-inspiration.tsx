"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, Eye, Film, Play, RotateCcw, ShieldCheck } from "lucide-react";
import {
  communityFor,
  recreateHref,
  type CommunityItem,
  type CommunitySurface,
} from "@/lib/community-inspiration";

type Meta = { image?: string | null };

function CommunityMedia({ item }: { item: CommunityItem }) {
  const [meta, setMeta] = useState<Meta>({});
  const [videoFailed, setVideoFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch("/api/community/meta?url=" + encodeURIComponent(item.sourceHref))
      .then((response) => (response.ok ? response.json() : null))
      .then((value) => {
        if (alive && value) setMeta({ image: value.image });
      })
      .catch(() => null);
    return () => { alive = false; };
  }, [item.sourceHref]);

  if (meta.video && !videoFailed) {
    return (
      <video
        className="communityVideo"
        src={meta.video}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={meta.image || undefined}
        onError={() => setVideoFailed(true)}
      />
    );
  }

  if (meta.image) {
    return <img className="communityPoster" src={meta.image} alt={item.title + " preview"} loading="lazy" />;
  }

  return (
    <div className={"communityFallback tone-" + item.tone}>
      <Film size={24} />
      <span>Official project preview</span>
    </div>
  );
}

function Card({ item }: { item: CommunityItem }) {
  return (
    <article className="communityCard">
      <a className="communityMedia" href={item.sourceHref} target="_blank" rel="noreferrer">
        <CommunityMedia item={item} />
        <div className="communityShade" />
        <span className="communityBadge">{item.badge}</span>
        <span className="communityPlay"><Play size={15} fill="currentColor" /></span>
        {item.views && <span className="communityViews"><Eye size={11} /> {item.views}</span>}
      </a>
      <div className="communityBody">
        <div><small>{item.creator}</small><h3>{item.title}</h3></div>
        <p>{item.description}</p>
        {item.note && <div className="communityNote"><ShieldCheck size={11} /> {item.note}</div>}
        <div className="communityActions">
          <a className="ghost" href={item.sourceHref} target="_blank" rel="noreferrer">
            Official <ExternalLink size={11} />
          </a>
          {item.recreate ? (
            <Link className="primary" href={recreateHref(item)}>
              <RotateCcw size={11} /> Recreate in RAVS
            </Link>
          ) : (
            <span className="studyOnly">Study only</span>
          )}
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
          <p>Official public project-ийг үзээд, зөвшөөрөгдсөн тохиолдолд RAVS-ийн шинэ original хувилбараар эхэл.</p>
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

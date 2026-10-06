"use client";
import Link from "next/link";import { ArrowRight,Clapperboard } from "lucide-react";
export function Generator(){return <div className="heroPrompt"><div><Clapperboard size={18}/><span>Монгол prompt → AI Video / Image</span></div><p>RAVS Studio дээр model, reference, aspect ratio, duration болон audio-г бүрэн удирдаарай.</p><Link href="/studio" className="primary">Studio нээх <ArrowRight size={17}/></Link></div>}

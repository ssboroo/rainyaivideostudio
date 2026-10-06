import { Suspense } from "react";import { StudioClient } from "@/components/studio-client";
export const dynamic="force-dynamic";export default function StudioPage(){return <Suspense fallback={<div className="pageLoading">RAVS Studio ачаалж байна…</div>}><StudioClient/></Suspense>}

import {NextResponse} from "next/server";
import {models} from "@/lib/models";
import {ensureLiveHiggsfieldTariffs,liveCatalogStatus,liveCatalogIds} from "@/lib/higgsfield-live-feed";
export const dynamic="force-dynamic";
export async function GET(){
 try{await ensureLiveHiggsfieldTariffs();}catch{}
 const known=new Set(models.map(m=>m.modelId));
 const upstreamUnreviewed=liveCatalogIds().filter(id=>!known.has(id));
 return NextResponse.json({models,upstreamUnreviewed,liveCatalog:liveCatalogStatus(),disclaimer:"Танигдаагүй API schema болон тарифыг шууд худалдаанд гаргахгүй."},{headers:{"Cache-Control":"no-store"}});
}

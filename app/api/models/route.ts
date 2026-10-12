import {NextResponse} from "next/server";
import {models} from "@/lib/models";
import {ensureLiveHiggsfieldTariffs,liveCatalogStatus} from "@/lib/higgsfield-live-feed";
export const dynamic="force-dynamic";
export async function GET(){
 try{await ensureLiveHiggsfieldTariffs();}catch{}
 return NextResponse.json({models,liveCatalog:liveCatalogStatus(),disclaimer:"Танигдаагүй API schema болон тарифыг шууд худалдаанд гаргахгүй."},{headers:{"Cache-Control":"no-store"}});
}

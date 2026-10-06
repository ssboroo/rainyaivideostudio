import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {Sidebar} from '@/components/sidebar';
import {ModelGuide,MediaSizeGuide} from '@/components/model-guide';
import {getModel,models} from '@/lib/models';
export function generateStaticParams(){return models.map(model=>({slug:model.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const model=getModel(slug);return {title:(model?.name||'Загвар')+' · Монгол заавар · RAVS'};}
export default async function ModelGuidePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const model=getModel(slug);if(!model)notFound();
 return <main className="shell"><Sidebar/><section className="content"><header className="topbar"><div><b>Загварын гарын авлага</b><span>Хэмжээ, тохиргоо, алхамчилсан зөвлөгөө</span></div><Link className="ghost" href="/explore#model-library"><ArrowLeft size={15}/> Загварын сан</Link></header><div className="modelGuidePage"><div className="modelGuideHero"><div><span className="eyebrow">{model.maker||model.provider}</span><h1>{model.name}</h1></div>{model.apiVerified&&<Link className="primary" href={'/studio?model='+model.slug}>Энэ загвараар бүтээх <ArrowRight size={15}/></Link>}</div><ModelGuide model={model}/><MediaSizeGuide/></div></section></main>;
}

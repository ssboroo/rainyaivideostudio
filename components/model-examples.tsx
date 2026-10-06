'use client';

import Link from 'next/link';
import type { RavsModel } from '@/lib/models';
import { examplesForModel, inspirationDisclosure, modelExampleHref } from '@/lib/model-examples';

export function ModelExamples({model,onUsePrompt}:{model:RavsModel;onUsePrompt?:(prompt:string)=>void}) {
 const examples=examplesForModel(model);
 return <section className="modelExamples" aria-label={model.name+' бүтээлийн жишээ'}>
  <header><span className="eyebrow">{model.kind==='image'?'ЗУРГИЙН САНАА':'ХӨДӨЛГӨӨН БА КАДР'}</span><h2>{model.name} · {examples.videos.length?'Зориулалтын жишээ':'Эхлэх санаа'}</h2><p>{examples.reason || examples.purpose}</p></header>
  {!!examples.videos.length&&<><p className="exampleDisclosure">{inspirationDisclosure}</p><div className="modelExampleGrid">{examples.videos.map(video=><article key={video.id}><video controls playsInline preload="none" poster={video.poster || undefined} src={video.previewSrc} aria-label={video.title}/><div><h3>{video.title}</h3><p>{video.description}</p><small>{video.use}</small><a href={video.official} target="_blank" rel="noopener noreferrer">Жишээний эх сурвалж ↗</a></div></article>)}</div></>}
  <div className="modelExamplePrompt"><small>{examples.mode} · ЖИШЭЭ ТАЙЛБАР</small>{!examples.videos.length&&<p className="exampleGuideNote">{model.kind==='image'?'Зургийн зохиомж, гэрэл болон хадгалах хэсгээ дараах жишээгээр төлөвлөөрэй.':'Энэ хувилбарт баталгаажсан шууд видео жишээ нэмэгдээгүй. Дараах тайлбар, оролтын заавраар эхлээрэй.'}</p>}{examples.translation&&<p>{examples.translation}</p>}<p>{examples.prompt}</p><div className="exampleActions">{model.apiVerified&&(onUsePrompt?<button type="button" className="primary" onClick={()=>onUsePrompt(examples.prompt)}>Энэ загварт тайлбар ашиглах</button>:<Link className="primary" href={modelExampleHref(model,examples.prompt)}>Энэ загвараар эхлэх</Link>)}<Link href={'/models/'+model.slug}>Оролт ба тохиргооны заавар →</Link></div></div>
 </section>;
}

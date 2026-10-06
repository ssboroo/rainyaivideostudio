import type {RavsModel} from './models.ts';
import {modelMode} from './model-guides.ts';
export function groupModelFamilies(input: RavsModel[]) {
 const groups=new Map<string,{name:string;models:RavsModel[]}>();
 for(const m of input){const name=modelFamilyName(m);const group=groups.get(name)||{name,models:[]};group.models.push(m);groups.set(name,group);}
 const priority=['Seedance 2.5','Seedance 2.0','Kling 3.0','Kling 2.6','Kling 2.5','Kling O1 (Omni)','Kling O3','Marketing Studio Image','Wan 3.0 Prime','Genjutsu'];
 return [...groups.values()].sort((a,b)=>{const x=priority.indexOf(a.name),y=priority.indexOf(b.name);return (x<0?priority.length:x)-(y<0?priority.length:y);});
}
export function modelFamilyName(m:RavsModel){
 const id=m.modelId;
 const families:[RegExp,string][]=[
  [/^bytedance\/seedance-2\.5\//,'Seedance 2.5'],[/^bytedance\/seedance-2\.0\//,'Seedance 2.0'],
  [/^kling-video\/(v3\.0(?:-turbo)?\/|v3\/motion-control\/)/,'Kling 3.0'],
  [/^kling-video\/(v2\.6\/|motion-control\/)/,'Kling 2.6'],[/^kling-video\/v2\.5-turbo\//,'Kling 2.5'],
  [/^kling-video\/o3\//,'Kling O3'],[/^kling-video\/omni\//,'Kling O1 (Omni)'],
  [/^marketing-studio\/image(?:\/|$)/,'Marketing Studio Image'],[/\/genjutsu\//,'Genjutsu'],
  [/^alibaba\/wan-3\.0-prime\//,'Wan 3.0 Prime'],[/^alibaba\/wan-3\.0\//,'Wan 3.0'],
  [/^wan\/v2\.7\//,'Wan 2.7'],[/^wan\/v2\.6\//,'Wan 2.6'],[/^lightricks\/ltx-2\.5\//,'LTX 2.5'],
  [/^alibaba\/happy-horse\/v1\.1\//,'HappyHorse 1.1'],[/^alibaba\/happy-horse\//,'Happy Horse 1.0'],
  [/^minimax\/h3\//,'MiniMax H3'],[/^minimax\/hailuo-2\.3\//,'MiniMax Hailuo 2.3'],
  [/^higgsfield-ai\/soul\/v2\//,'Soul 2'],[/^alibaba\/qwen-image-3\//,'Qwen Image 3'],
 ];
 return families.find(([pattern])=>pattern.test(id))?.[1]||m.name.replace(/ · Текст → Видео$/,'');
}
export function modelVariantLabel(m:RavsModel){
 const id=m.modelId;let mode=modelMode(m);
 if(/\/image-reference$/.test(id))mode='Зургийн жишиг → Видео';
 if(/\/video-reference$/.test(id))mode='Видеоны жишиг → Видео';
 const quality=[/\/4k\//.test(id)?'4K':'',/-turbo\//.test(id)?'Turbo':'',/\/fast$/.test(id)?'Fast':'',/\/(pro|std|standard)(\/|$)/.test(id)?(/\/pro(\/|$)/.test(id)?'Pro':'Standard'):'',/\/flare$/.test(id)?'Flare':'',/\/sunburst$/.test(id)?'Sunburst':''].filter(Boolean);
 return [mode,...quality].join(' · ');
}

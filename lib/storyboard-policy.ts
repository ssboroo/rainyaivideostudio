import {createHash} from 'node:crypto';
import type {DirectorPlan} from './creative-director.ts';
export function storyboardHash(plan:DirectorPlan,references?:unknown){return createHash('sha256').update(JSON.stringify([plan,references??null])).digest('hex');}
export function approvedStoryboard(plan:DirectorPlan|undefined,approval:string|undefined,references?:unknown){return !!plan&&!!approval&&storyboardHash(plan,references)===approval;}
export function storyboardTimeline(plan:DirectorPlan){let time=0;return plan.scenes.map(scene=>{const start=time;time+=scene.durationSeconds;return {...scene,startSeconds:start,endSeconds:time};});}
function srtTime(seconds:number){const ms=Math.round(seconds*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;}
export function storyboardNarrationSrt(plan:DirectorPlan){let index=0;return storyboardTimeline(plan).filter(s=>s.voiceover.trim()).map(s=>{
 const text=s.voiceover.trim();if(text.length>240||text.includes('-->'))throw new Error('Кадрын дууны текст 240 тэмдэгтээс хэтрэхгүй, хугацааны тэмдэглэгээгүй байна.');
 return `${++index}\n${srtTime(s.startSeconds)} --> ${srtTime(s.endSeconds)}\n${text}\n`;
}).join('\n');}

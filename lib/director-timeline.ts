/** Browser/server shared draft captions: timing is based only on planned durations. */
export type TimedSubtitleScene={durationSeconds:number;subtitle:string};
function stamp(sec:number){
 const totalMs=Math.round(sec*1000);
 const h=Math.floor(totalMs/3600000),m=Math.floor(totalMs/60000)%60,s=Math.floor(totalMs/1000)%60,ms=totalMs%1000;
 return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+','+String(ms).padStart(3,'0');
}
export function draftSubtitleSrt(scenes:TimedSubtitleScene[]):string{
 if(!Array.isArray(scenes)||scenes.length>120)throw new Error('Кадрын тоо буруу.');
 let offset=0,number=0,result='';
 for(const scene of scenes){
  if(!Number.isFinite(scene.durationSeconds)||scene.durationSeconds<=0||scene.durationSeconds>60)throw new Error('Кадрын хугацаа буруу.');
  const start=offset;offset+=scene.durationSeconds;
  const subtitle=String(scene.subtitle||'').trim().replace(/\s*\n\s*/g,' ');
  if(!subtitle)continue;
  if(subtitle.length>400||subtitle.includes('-->'))throw new Error('Хадмал 400 тэмдэгтээс ихгүй, хугацааны тэмдэггүй байх ёстой.');
  result+=String(++number)+'\n'+stamp(start)+' --> '+stamp(offset)+'\n'+subtitle+'\n\n';
 }
 return result;
}
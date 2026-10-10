/**
 * YouTube URLs are used only for official embedded preview. We NEVER download,
 * rip, proxy, or extract YouTube streams. Clip processing requires a separately
 * provided original media file owned or licensed by the user.
 */
export function parseYouTubeVideo(input: string): {id:string;start:number}|null {
 try {
  const url=new URL(input.trim());
  if(url.protocol!=="https:"||url.username||url.password||url.port)return null;
  const host=url.hostname.toLowerCase();
  let id="";
  if(host==="youtu.be")id=url.pathname.split("/")[1]||"";
  else if(["youtube.com","www.youtube.com","m.youtube.com","www.youtube-nocookie.com","youtube-nocookie.com"].includes(host)){
    const segments=url.pathname.split("/").filter(Boolean);
    if(url.pathname==="/watch")id=url.searchParams.get("v")||"";
    else if(["shorts","live","embed"].includes(segments[0]))id=segments[1]||"";
  } else return null;
  if(!/^[A-Za-z0-9_-]{11}$/.test(id))return null;
  const raw=url.searchParams.get("t")||url.searchParams.get("start")||"0";
  let seconds=0;
  if(/^\d+$/.test(raw))seconds=Number(raw);
  else if(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.test(raw)){
    const m=/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(raw)!;
    seconds=Number(m[1]||0)*3600+Number(m[2]||0)*60+Number(m[3]||0);
  }
  if(!Number.isSafeInteger(seconds)||seconds<0||seconds>86400)seconds=0;
  return{id,start:seconds};
 }catch{return null;}
}
export function youtubeClipEmbed(id:string,start:number,end:number) {
 if(!/^[A-Za-z0-9_-]{11}$/.test(id))throw new Error("YouTube видео ID буруу");
 if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end<=start||end-start>30)throw new Error("Клип 1–30 секунд");
 const params=new URLSearchParams({start:String(Math.floor(start)),end:String(Math.ceil(end)),rel:"0",playsinline:"1"});
 return "https://www.youtube-nocookie.com/embed/"+id+"?"+params.toString();
}

/** A reusable playback segment, NOT an extracted or downloadable MP4. */
export function youtubeClipSharePath(id:string,start:number,end:number){
 // Reuse the same strict validation as the official player URL.
 youtubeClipEmbed(id,start,end);
 const search=new URLSearchParams({
  v:id,
  start:String(Math.floor(start)),
  end:String(Math.ceil(end)),
 });
 return "/clip?"+search.toString();
}

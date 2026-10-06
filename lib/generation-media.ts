export function mediaFrom(output: unknown): {type:"image"|"video";url:string}|null {
 if (!output || typeof output !== "object") return null;
 const value = output as Record<string,unknown>;
 let type:"image"|"video"="video",candidate:unknown;
 if(value.video && typeof value.video === "object") candidate=(value.video as Record<string,unknown>).url;
 else if(Array.isArray(value.images)&&value.images[0]&&typeof value.images[0]==="object"){candidate=value.images[0].url;type="image";}
 else if(typeof value.url==="string")candidate=value.url;
 else if(value.output)return mediaFrom(value.output);
 if(typeof candidate!=="string")return null;
 try{const parsed=new URL(candidate);if(!["https:","http:"].includes(parsed.protocol))return null;return{type,url:parsed.toString()};}catch{return null;}
}

/** Restrict cookie-authenticated clip uploads to the site's known public origins.
 * Railway's internal Request.url can be http://localhost:8080 and must not be
 * compared to the external browser Origin. Never trust X-Forwarded-Host here.
 */
export function isTrustedClipRequest(req: Request): boolean {
 if(req.headers.get("sec-fetch-site")==="cross-site")return false;
 const raw=req.headers.get("origin");
 if(!raw)return req.headers.get("sec-fetch-site")==="same-origin";
 try {
  const origin=new URL(raw);
  if(origin.username||origin.password||origin.pathname!=="/"||origin.search||origin.hash)return false;
  const known=new Set(["https://video.rainy.studio","https://rainyaivideostudio-production.up.railway.app"]);
  for(const candidate of [process.env.APP_URL,process.env.EMAIL_PUBLIC_URL]){
   if(!candidate)continue;
   try {
    const url=new URL(candidate);
    if(url.protocol==="https:"&&!url.username&&!url.password&&!url.port&&!url.search&&!url.hash)
      known.add(url.origin);
   }catch{}
  }
  if(process.env.NODE_ENV!=="production"){
   known.add("http://localhost:3000");known.add("http://localhost:8080");
   known.add("http://127.0.0.1:3000");known.add("http://127.0.0.1:8080");
  }
  return known.has(origin.origin);
 }catch{return false;}
}

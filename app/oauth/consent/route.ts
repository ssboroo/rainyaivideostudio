import {getSessionUser} from "@/lib/session";
import {env} from "@/lib/env";
import {boundedBody,checkOAuthLimit,readConsent,validateAuthorization,issueCode,OAuthError,oauthFailure} from "@/lib/mcp-oauth";
export async function POST(req:Request){try{
 checkOAuthLimit(req,"consent",20);
 const originMatches=req.headers.get("origin")===new URL(env.appUrl()).origin;
 const crossSite=req.headers.get("sec-fetch-site")==="cross-site";
 if(!originMatches||crossSite){
  // Boolean diagnostics only; never log headers, consent payloads or credentials.
  console.warn("[ravs_oauth_consent_origin]",JSON.stringify({originMatches,crossSite,nullOrigin:req.headers.get("origin")==="null",hasOrigin:req.headers.has("origin")}));
  throw new OAuthError("invalid_request",403);
 }
 const user=await getSessionUser();if(!user)throw new OAuthError("access_denied",401);
 if(!req.headers.get("content-type")?.startsWith("application/x-www-form-urlencoded"))throw new OAuthError("invalid_request");
 const p=new URLSearchParams(await boundedBody(req));const request=readConsent(p.get("consent")||"",user.id);
 const validated=await validateAuthorization(new URLSearchParams({client_id:request.clientId,redirect_uri:request.redirectUri,code_challenge:request.challenge,code_challenge_method:"S256",response_type:"code",resource:request.resource,scope:request.scope,state:request.state}));
 const redirect=new URL(validated.redirectUri);if(validated.state)redirect.searchParams.set("state",validated.state);
 if(p.get("decision")==="allow")redirect.searchParams.set("code",await issueCode(user.id,validated));else redirect.searchParams.set("error","access_denied");
 return new Response(null,{status:303,headers:{Location:redirect.toString(),"Cache-Control":"no-store","Referrer-Policy":"no-referrer"}});
 }catch(e){return oauthFailure(e);}}

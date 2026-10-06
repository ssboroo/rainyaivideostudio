import { db } from "@/lib/db";
import { boundedBody, checkOAuthLimit, validRedirect, OAuthError, oauthFailure, oauthResponse } from "@/lib/mcp-oauth";
export async function POST(req:Request){try{
 checkOAuthLimit(req,"register",10);
 if(!req.headers.get("content-type")?.startsWith("application/json"))throw new OAuthError("invalid_request");
 let body;try{body=JSON.parse(await boundedBody(req));}catch(e){if(e instanceof OAuthError)throw e;throw new OAuthError("invalid_client_metadata");}
 if(!body||typeof body!=="object"||!Array.isArray(body.redirect_uris)||!body.redirect_uris.length||body.redirect_uris.length>8||!body.redirect_uris.every(validRedirect))throw new OAuthError("invalid_redirect_uri");
 if(body.token_endpoint_auth_method&&body.token_endpoint_auth_method!=="none")throw new OAuthError("invalid_client_metadata");
 if(body.grant_types&&(!Array.isArray(body.grant_types)||body.grant_types.some((g:unknown)=>!['authorization_code','refresh_token'].includes(String(g)))))throw new OAuthError("invalid_client_metadata");
 if(body.response_types&&(!Array.isArray(body.response_types)||body.response_types.some((g:unknown)=>g!=="code")))throw new OAuthError("invalid_client_metadata");
 const name=typeof body.client_name==="string"?body.client_name.trim().slice(0,120):"MCP холболт";
 const client=await db.oAuthClient.create({data:{name:name||"MCP холболт",redirectUris:[...new Set<string>(body.redirect_uris)]}});
 return oauthResponse({client_id:client.id,client_id_issued_at:Math.floor(client.createdAt.getTime()/1000),client_name:client.name,redirect_uris:client.redirectUris,token_endpoint_auth_method:"none",grant_types:["authorization_code","refresh_token"],response_types:["code"]},201);
 }catch(e){return oauthFailure(e);}}
export function OPTIONS(){return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"}});}

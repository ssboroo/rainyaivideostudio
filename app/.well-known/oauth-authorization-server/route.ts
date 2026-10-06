import { oauthMetadata, oauthResponse } from "@/lib/mcp-oauth";
export function GET(){return oauthResponse(oauthMetadata());}

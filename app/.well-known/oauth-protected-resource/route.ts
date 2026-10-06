import { protectedResourceMetadata, oauthResponse } from "@/lib/mcp-oauth";
export function GET(){return oauthResponse(protectedResourceMetadata());}

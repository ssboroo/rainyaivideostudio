import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
export function jsonError(message: string, status=400, details?: unknown) { return NextResponse.json({error:message,details},{status}); }
export async function requireUser() { return getSessionUser(); }
export async function requireAdmin() { const user=await getSessionUser(); return user?.role==="ADMIN" ? user : null; }

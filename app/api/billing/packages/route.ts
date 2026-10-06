import { NextResponse } from "next/server";import { getCreditPackages } from "@/lib/billing";export async function GET(){return NextResponse.json({packages:getCreditPackages()})}

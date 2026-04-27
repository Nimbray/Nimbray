import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "nimbrayai",
    version: "89.1.0",
    timestamp: new Date().toISOString(),
    provider: process.env.AI_PROVIDER || "demo"
  });
}

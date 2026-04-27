import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "NimbrayAI",
    version: "V90 Final Polish",
    status: "healthy"
  });
}

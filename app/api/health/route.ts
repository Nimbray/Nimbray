import { NextResponse } from "next/server";
import { uploadLimits } from "../../../lib/upload-router";
import { visionStatus } from "../../../lib/vision-router";

export const runtime = "nodejs";

export async function GET() {
  const vision = visionStatus();
  return NextResponse.json({
    ok: true,
    service: "nimbray-api",
    routes: {
      chat: "/api/chat",
      status: "/api/status",
      health: "/api/health",
      parseDoc: "/api/parse-doc"
    },
    providers: {
      ai: (process.env.AI_PROVIDER || "demo").toLowerCase(),
      vision
    },
    uploads: {
      enabled: process.env.ENABLE_DOCUMENT_PARSING !== "false",
      limits: uploadLimits(),
      imageAnalysis: vision.enabled ? (vision.configured ? "provider-ready" : "fallback-ready") : "disabled"
    }
  });
}

import { NextResponse } from "next/server";
import { providerStatus } from "../../../lib/provider-router";

export async function GET() {
  const providerRouter = await providerStatus();
  return NextResponse.json({
    ok: true,
    service: "nimbrayai",
    version: "v90-intelligent-project-brain",
    providerRouter: {
      activeProvider: providerRouter.activeProvider,
      plan: providerRouter.plan,
      providers: providerRouter.providers
    },
    routes: {
      chat: true,
      status: true,
      health: true,
      parseDoc: process.env.ENABLE_DOCUMENT_PARSING !== "false"
    }
  });
}

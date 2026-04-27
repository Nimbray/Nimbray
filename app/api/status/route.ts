import { NextResponse } from "next/server";
import { routingSummary } from "../../../lib/model-router";
import { providerStatus } from "../../../lib/provider-router";

export async function GET() {
  const providerRouter = await providerStatus();
  const activeProvider = providerRouter.activeProvider;
  return NextResponse.json({
    ok: true,
    provider: activeProvider,
    model:
      activeProvider === "ollama" ? providerRouter.providers.ollama.model :
      activeProvider === "groq" ? providerRouter.providers.groq.model :
      activeProvider === "openrouter" ? providerRouter.providers.openrouter.model :
      "nimbray-demo-engine-v90",
    router: routingSummary(),
    providerRouter,
    ollama: providerRouter.providers.ollama,
    features: {
      v90ProviderRouter: true,
      v90KnowledgeRouter: true,
      intelligentFallbacks: true,
      v40ReleaseCandidate: true,
      consolidatedLocalBrain: true,
      v23DialoguePersonality: true,
      v26SafeHumanBrain: true,
      publicBetaFoundation: true,
      v12RealProductFoundation: true,
      sourceCache: true,
      responseProfiles: true,
      freeSources: process.env.ENABLE_FREE_SOURCES !== "false",
      wikipedia: process.env.ENABLE_WIKIPEDIA !== "false",
      localKnowledge: process.env.ENABLE_LOCAL_KNOWLEDGE !== "false",
      userKnowledge: process.env.ENABLE_USER_KNOWLEDGE !== "false",
      memory: process.env.ENABLE_MEMORY !== "false",
      wikidata: process.env.ENABLE_WIKIDATA === "true",
      openLibrary: process.env.ENABLE_OPENLIBRARY === "true",
      arxiv: process.env.ENABLE_ARXIV === "true",
      crossref: process.env.ENABLE_CROSSREF === "true",
      pubmed: process.env.ENABLE_PUBMED === "true",
      stackexchange: process.env.ENABLE_STACKEXCHANGE === "true",
      officialDocs: process.env.ENABLE_OFFICIAL_DOCS !== "false",
      rag: process.env.ENABLE_FREE_SOURCES !== "false",
      documentParsing: process.env.ENABLE_DOCUMENT_PARSING !== "false",
      pdfParsing: process.env.ENABLE_PDF_PARSE !== "false",
      docxParsing: process.env.ENABLE_DOCX_PARSE !== "false",
      adminPanel: process.env.ENABLE_ADMIN_PANEL !== "false",
      betaFeedback: process.env.ENABLE_BETA_FEEDBACK !== "false",
      inviteMode: process.env.ENABLE_INVITE_MODE === "true"
    }
  });
}

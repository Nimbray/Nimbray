import { buildContext, loadInternalKnowledge, rankUserKnowledge, type SourceSnippet } from "./free-sources";

type KnowledgeInput = {
  query: string;
  userKnowledge: string[];
  conversationIntent: string;
  platformIntent: string;
  sourceRequested: boolean;
};

export type KnowledgeRouteResult = {
  context: string;
  sources: SourceSnippet[];
  route: "none" | "user-files" | "local-memory" | "hybrid" | "external";
  reason: string;
};

function normalize(text: string) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function shouldUseKnowledgeRouter(input: KnowledgeInput) {
  const q = normalize(input.query);
  const asksFiles = /\b(fichier|document|upload|piece jointe|pdf|docx|csv|source utilisateur|mes sources|ce fichier|dans le fichier)\b/.test(q);
  const asksProject = /\b(nimbray|projet|workspace|roadmap|branche|github|vercel|api|backend|frontend|agent ia|agent backend|agent frontend)\b/.test(q);
  const asksResearch = /\b(source|sources|citation|preuve|recherche|verifie|explique|definition|documente|internet|web|mdn|arxiv|pubmed)\b/.test(q);
  const longQuestion = input.query.length > 260;
  return input.sourceRequested || asksFiles || asksProject || asksResearch || longQuestion || ["document", "research"].includes(input.conversationIntent) || ["document", "research", "super_brain", "project"].includes(input.platformIntent);
}

function pickRoute(input: KnowledgeInput): KnowledgeRouteResult["route"] {
  const q = normalize(input.query);
  const hasUserKnowledge = input.userKnowledge.length > 0;
  const asksFiles = /\b(fichier|document|upload|piece jointe|pdf|docx|csv|mes sources|ce fichier|dans le fichier)\b/.test(q);
  const asksProject = /\b(nimbray|projet|workspace|roadmap|branche|github|vercel|api|backend|frontend|agent ia)\b/.test(q);
  if (hasUserKnowledge && asksFiles) return "user-files";
  if (asksProject) return hasUserKnowledge ? "hybrid" : "local-memory";
  if (input.sourceRequested || /\b(web|internet|citation|source|sources|recherche|verifie|mdn|arxiv|pubmed)\b/.test(q)) return hasUserKnowledge ? "hybrid" : "external";
  if (hasUserKnowledge) return "hybrid";
  return "local-memory";
}

export async function routeKnowledge(input: KnowledgeInput): Promise<KnowledgeRouteResult> {
  if (process.env.ENABLE_FREE_SOURCES === "false" || !shouldUseKnowledgeRouter(input)) {
    return { context: "", sources: [], route: "none", reason: "contexte non nécessaire pour cette demande" };
  }

  const route = pickRoute(input);
  if (route === "user-files") {
    const sources = rankUserKnowledge(input.query, input.userKnowledge, Number(process.env.USER_KNOWLEDGE_TOP_K || process.env.RAG_TOP_K || 5));
    return { context: formatContext(sources), sources, route, reason: "priorité aux fichiers utilisateur" };
  }

  if (route === "local-memory") {
    const sources = loadInternalKnowledge(input.query);
    return { context: formatContext(sources), sources, route, reason: "priorité à la mémoire projet locale" };
  }

  const built = await buildContext(input.query, input.userKnowledge);
  return {
    context: built.context,
    sources: built.sources,
    route,
    reason: route === "hybrid" ? "mélange fichiers utilisateur, mémoire locale et sources gratuites" : "sources gratuites externes activées"
  };
}

function formatContext(sources: SourceSnippet[]) {
  if (!sources.length) return "";
  return sources.slice(0, Number(process.env.RAG_TOP_K || 6)).map((source, index) => {
    return `[Source ${index + 1}] ${source.title}\nType: ${source.type || "local"}\n${source.url ? `URL: ${source.url}\n` : ""}${source.content}`;
  }).join("\n\n---\n\n");
}

export function knowledgeRouterGuidance(result: KnowledgeRouteResult) {
  if (result.route === "none") return "Knowledge Router V90 : aucune source ajoutée, répondre naturellement.";
  return `Knowledge Router V90 : route=${result.route}, raison=${result.reason}. Utilise les sources comme contexte prioritaire sans inventer. Si les sources ne suffisent pas, dis-le simplement.`;
}

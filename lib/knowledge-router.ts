export type KnowledgeRoute = {
  kind: "local" | "user_knowledge" | "project" | "research" | "web_like" | "direct";
  shouldBuildContext: boolean;
  wantsSources: boolean;
  confidence: "low" | "medium" | "high";
  reasons: string[];
  guidance: string;
};

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectSourceRequest(text: string) {
  return /\b(avec sources?|source\??|sources\??|citation|cite|preuve|preuves|reference|references|référence|références|d ou tu sors|d’où tu sors|lien|liens)\b/i.test(text);
}

export function routeKnowledge(input: {
  latestUser: string;
  conversationIntent?: string;
  platformIntent?: string;
  userKnowledgeCount?: number;
}): KnowledgeRoute {
  const latestUser = input.latestUser || "";
  const q = normalize(latestUser);
  const reasons: string[] = [];
  const wantsSources = detectSourceRequest(latestUser);

  const projectSignals = /\b(nimbray|projet ia|vercel|github|pull request|branche|backend|frontend|agent ia|agent produit|workspace|checkpoint|knowledge router|main|ci|deploy|deploiement)\b/.test(q);
  const uploadedSignals = /\b(document|fichier|source jointe|sources jointes|piece jointe|pdf|docx|csv|json|base locale|mes sources|ce fichier|dans le fichier|uploaded|upload)\b/.test(q);
  const researchSignals = /\b(recherche|analyse|compare|comparaison|audit|strategie|roadmap|veille|recent|actuel|aujourd hui|derniere version|latest|sources|preuve|citation)\b/.test(q);
  const factualSignals = /\b(qui est|qu est ce que|definition|explique|pourquoi|comment|combien|date|loi|prix|version|documentation)\b/.test(q);

  if (wantsSources) reasons.push("sources explicites demandées");
  if (projectSignals) reasons.push("contexte projet Nimbray détecté");
  if (uploadedSignals) reasons.push("documents ou sources utilisateur détectés");
  if (researchSignals) reasons.push("demande de recherche/analyse détectée");
  if (factualSignals) reasons.push("question factuelle détectée");

  let kind: KnowledgeRoute["kind"] = "direct";
  if (projectSignals) kind = "project";
  else if (uploadedSignals && (input.userKnowledgeCount || 0) > 0) kind = "user_knowledge";
  else if (researchSignals || input.conversationIntent === "research" || input.platformIntent === "research" || input.platformIntent === "super_brain") kind = "research";
  else if (wantsSources || latestUser.length > 260) kind = "web_like";
  else if (uploadedSignals) kind = "user_knowledge";
  else if (factualSignals) kind = "local";

  const shouldBuildContext =
    wantsSources ||
    kind === "user_knowledge" ||
    kind === "research" ||
    kind === "web_like" ||
    (kind === "project" && latestUser.length > 180);

  const confidence: KnowledgeRoute["confidence"] = reasons.length >= 2 ? "high" : reasons.length === 1 ? "medium" : "low";
  const reasonText = reasons.length ? reasons.join(" ; ") : "aucune source externe nécessaire";

  return {
    kind,
    shouldBuildContext,
    wantsSources,
    confidence,
    reasons,
    guidance:
      `Knowledge Router V89 : route=${kind}, contexte=${shouldBuildContext ? "chargé" : "non chargé"}, confiance=${confidence}. ` +
      `Raison : ${reasonText}. ` +
      `Réponds avec les sources seulement si l'utilisateur les demande ou si elles sont indispensables. ` +
      `Si aucune source fiable n'est disponible, dis clairement ce qui est connu, supposé ou à vérifier.`
  };
}

export function knowledgeRouterSummary() {
  return {
    version: "v89",
    routes: ["direct", "local", "user_knowledge", "project", "research", "web_like"],
    default: "direct"
  };
}

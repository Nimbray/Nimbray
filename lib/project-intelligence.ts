export type ProjectSnapshot = {
  projectName: string;
  currentVersion: string;
  focus: string;
  decisions: string[];
  nextActions: string[];
  risks: string[];
  confidence: "low" | "medium" | "high";
};

type MessageLike = { role: string; content: string };

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanLine(text: string, max = 180) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/^[-•\d\.\s]+/, "")
    .trim()
    .slice(0, max);
}

function unique(list: string[], max = 8) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of list.map((x) => cleanLine(x)).filter(Boolean)) {
    const key = normalize(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

function inferLatestVersion(text: string) {
  const matches = Array.from(text.matchAll(/\bV\s?(\d{1,3})(?:[\.,](\d{1,3}))?\b/gi));
  if (!matches.length) return "V84";
  const last = matches[matches.length - 1];
  return `V${last[1]}${last[2] ? `.${last[2]}` : ""}`;
}

function extractDecisionCandidates(messages: MessageLike[], memory: string[]) {
  const joined = [...memory, ...messages.slice(-14).map((m) => m.content)].join("\n");
  const lines = joined.split(/\n|\. /g).map((x) => x.trim()).filter(Boolean);
  return unique(lines.filter((line) => {
    const q = normalize(line);
    return /\b(decision|decide|on decide|on garde|on part sur|on passe|priorite|strategie|roadmap|version|deployer|deploiement|vercel|zip|safety|securite|silence|memoire|projet|backend|frontend|produit|agent ia|orchestration)\b/.test(q);
  }), 10);
}

function extractNextActions(messages: MessageLike[], latestUser: string) {
  const text = `${messages.slice(-10).map((m) => m.content).join("\n")}\n${latestUser}`;
  const q = normalize(text);
  const actions: string[] = [];

  if (/v87|natural product brain|personnalite|moins robotique|repetition|agent ia|messages emotionnels|orchestration/.test(q)) {
    actions.push("Livrer V87 Agent IA : personnalité plus naturelle, réponses émotionnelles plus humaines, anti-répétition et prochaines étapes plus claires.");
  }
  if (/backend|api|route|upload|provider|erreur|vercel/.test(q)) {
    actions.push("Backend : garder les réponses d’erreur utiles, ne pas casser app/api/chat/route.ts et préserver la compatibilité Vercel.");
  }
  if (/frontend|interface|mobile|chat|preview|piece jointe|upload/.test(q)) {
    actions.push("Frontend : traduire les états IA en expérience lisible côté chat, surtout mobile et pièces jointes.");
  }
  if (/produit|roadmap|mvp|priorite|utilisateur|valeur/.test(q)) {
    actions.push("Produit : classer les demandes en urgent, important et plus tard pour éviter les fonctionnalités gadgets.");
  }
  if (/ia|cerveau|memoire|naturel|sources|securite/.test(q)) {
    actions.push("IA : renforcer le style Nimbray, la prudence, le contexte projet et les réponses personnelles sans inventer de capacités.");
  }
  if (/pull request|pr|main|branche|ci|github actions|merge/.test(q)) {
    actions.push("Préparer la PR depuis la branche agent, documenter le handoff, mettre à jour le changelog et lancer les checks disponibles.");
  }
  if (!actions.length) {
    actions.push("Résumer l’état du projet, identifier la décision la plus importante, puis proposer une prochaine action concrète.");
  }
  return unique(actions, 7);
}

function extractRisks(messages: MessageLike[]) {
  const recent = normalize(messages.slice(-16).map((m) => m.content).join(" "));
  const risks: string[] = [];
  if (/ne reponds plus|silence|adieu|mourir|tuer|faire du mal/.test(recent)) {
    risks.push("Le silence ne doit jamais bloquer une réponse de sécurité ou de crise.");
  }
  if (/deploiement|vercel|prod|production|ci|build/.test(recent)) {
    risks.push("Éviter les changements de prompt ou de route qui cassent le build, le CI ou Vercel.");
  }
  if (/repetition|robotique|personnalite/.test(recent)) {
    risks.push("Trop polir le style peut rendre Nimbray fade ; garder une voix vivante mais sobre.");
  }
  if (/backend|frontend|app api chat|route/.test(recent)) {
    risks.push("Coordonner les branches Backend et Frontend si elles touchent aussi app/api/chat/route.ts ou le contrat de réponse.");
  }
  return unique(risks, 5);
}

export function buildProjectSnapshot(params: {
  latestUser: string;
  messages: MessageLike[];
  memory?: string[];
  projectContext?: any;
}): ProjectSnapshot {
  const memory = Array.isArray(params.memory) ? params.memory.map(String) : [];
  const projectContext = params.projectContext || {};
  const text = [params.latestUser, ...memory, ...params.messages.slice(-18).map((m) => m.content), JSON.stringify(projectContext)].join("\n");
  const currentVersion = inferLatestVersion(text);

  const decisions = extractDecisionCandidates(params.messages, memory);
  const nextActions = extractNextActions(params.messages, params.latestUser);
  const risks = extractRisks(params.messages);

  return {
    projectName: projectContext.projectName || "NimbrayAI",
    currentVersion,
    focus: projectContext.focus || "faire évoluer NimbrayAI comme une IA conversationnelle de production : sûre, naturelle, mémoire-projet, qualité, produit clair et agents internes coordonnés",
    decisions: decisions.length ? decisions : [
      "Regrouper les changements en versions cohérentes plutôt qu’en micro-patchs permanents.",
      "La sécurité et l’honnêteté passent avant le style, le silence ou le mode choisi.",
      "Chaque version doit enrichir le cerveau interne de NimbrayAI sans fragiliser le CI."
    ],
    nextActions,
    risks: risks.length ? risks : ["Ne pas ajouter de personnalité au détriment de la fiabilité, de la sécurité et des tests CI."],
    confidence: decisions.length >= 3 ? "high" : decisions.length ? "medium" : "low"
  };
}

export function projectGuidance(snapshot: ProjectSnapshot) {
  return `
V87 Project Context & Product Brain :
- Projet actif : ${snapshot.projectName}.
- Version/focus détecté : ${snapshot.currentVersion} — ${snapshot.focus}.
- Décisions utiles : ${snapshot.decisions.slice(0, 5).join(" ; ")}.
- Prochaines actions probables : ${snapshot.nextActions.slice(0, 5).join(" ; ")}.
- Risques à surveiller : ${snapshot.risks.slice(0, 4).join(" ; ")}.
- Si Backend, Frontend, IA ou Produit sont mentionnés, réponds comme un orchestrateur projet : décision commune, tâche par rôle seulement si utile, tests et PR.
Quand l'utilisateur demande où en est le projet, la prochaine version, les décisions, les agents ou la roadmap, réponds comme un copilote projet : clair, structuré, concret, sans inventer de faux historique.`;
}

export function projectIntelligenceReply(latestUser: string, snapshot: ProjectSnapshot) {
  const q = normalize(latestUser);
  const asksStatus = /\b(ou on en est|où on en est|etat du projet|point projet|resume le projet|resume projet|version actuelle|prochaine etape|prochaine version|roadmap|decisions prises|qu est ce qu on fait maintenant|sur quoi on bosse|continue le projet|agents internes|agent ia|handoff ia|backend|frontend|produit)\b/.test(q);
  if (!asksStatus) return null;

  const decisions = snapshot.decisions.slice(0, 5).map((d) => `- ${d}`).join("\n");
  const actions = snapshot.nextActions.slice(0, 6).map((a) => `- ${a}`).join("\n");
  const risks = snapshot.risks.slice(0, 4).map((r) => `- ${r}`).join("\n");

  return {
    intent: "project-intelligence-v87",
    content: `On est sur **${snapshot.projectName} ${snapshot.currentVersion}**.

Le cap actuel : ${snapshot.focus}.

**Décision commune**
On garde NimbrayAI simple, fiable et humain : Produit priorise, IA rend les réponses naturelles, Backend protège la robustesse, Frontend rend l’expérience claire.

**Décisions importantes retenues**
${decisions}

**Prochaines étapes**
${actions}

**Points de vigilance**
${risks}

Ma recommandation : on livre par branche agent, on documente le handoff, on lance les checks disponibles, puis on ouvre la PR vers \`main\` quand le saut de qualité est clair.`
  };
}

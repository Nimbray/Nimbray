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

const V90_PROJECT_STATE = {
  version: "V90",
  codename: "Final Polish",
  focus: "stabiliser le cerveau projet, le routage IA, la mémoire officielle, les réponses naturelles et l’upload sans casser Vercel",
  prioritySources: ["project-workspaces/00_project-memory/CHECKPOINT_V90.md", "CURRENT_SOURCE.json", "AGENT_CHANGELOG.json"],
  decisions: [
    "La branche main GitHub reste la source officielle vivante ; chaque contribution passe par une branche et une Pull Request.",
    "La mémoire projet doit prioriser CHECKPOINT_V90.md, CURRENT_SOURCE.json et AGENT_CHANGELOG.json avant les anciennes notes V74/V76.",
    "Nimbray doit répondre à l’état V90 actuel quand l’utilisateur demande où en est le projet.",
    "Les réponses personnelles doivent rester naturelles, sobres, sans formule répétitive ni série de questions.",
    "L’upload image reste conservé côté UI ; l’analyse vision serveur est planifiée pour V91."
  ],
  nextActions: [
    "Valider le résumé projet V90 en production avec : Résume l’état actuel du projet Nimbray.",
    "Valider une réponse personnelle courte et humaine avec : je me sens un peu seul.",
    "Vérifier que l’upload image affiche toujours la preview et retourne une réponse honnête sans prétendre analyser l’image.",
    "Lancer npm install --no-audit --no-fund, npm run typecheck et npm run build avant PR.",
    "Préparer la PR integration/v90-final-polish vers main."
  ],
  risks: [
    "Ne pas réintroduire les anciennes références V74/V76 comme état actuel du projet.",
    "Ne pas casser /api/chat, /api/status, /api/health, /api/parse-doc ni le build Vercel.",
    "Ne pas promettre d’analyse visuelle serveur avant V91."
  ]
};

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s\.\/]/g, " ")
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
  const normalized = normalize(text);
  if (/\bv90\b|checkpoint v90|final polish|vision serveur|integration\/v90/.test(normalized)) return V90_PROJECT_STATE.version;
  const matches = Array.from(text.matchAll(/\bV\s?(\d{1,3})(?:[\.,](\d{1,3}))?\b/gi));
  if (!matches.length) return V90_PROJECT_STATE.version;
  const highest = matches
    .map((m) => ({ major: Number(m[1] || 0), minor: Number(m[2] || 0) }))
    .sort((a, b) => b.major - a.major || b.minor - a.minor)[0];
  return highest.major < 90 ? V90_PROJECT_STATE.version : `V${highest.major}${highest.minor ? `.${highest.minor}` : ""}`;
}

function extractDecisionCandidates(messages: MessageLike[], memory: string[]) {
  const joined = [...memory, ...messages.slice(-14).map((m) => m.content)].join("\n");
  const lines = joined.split(/\n|\. /g).map((x) => x.trim()).filter(Boolean);
  return unique(lines.filter((line) => {
    const q = normalize(line);
    return /\b(decision|decide|on decide|on garde|on part sur|on passe|priorite|strategie|roadmap|version|deployer|deploiement|vercel|zip|safety|securite|silence|memoire|projet|checkpoint|changelog)\b/.test(q);
  }), 10);
}

function extractNextActions(messages: MessageLike[], latestUser: string) {
  const text = `${messages.slice(-10).map((m) => m.content).join("\n")}\n${latestUser}`;
  const q = normalize(text);
  const actions: string[] = [];

  if (/v90|memoire|memory|project intelligence|projet|checkpoint|source|changelog/.test(q)) {
    actions.push("Stabiliser V90 autour de la mémoire projet officielle, du routage IA et des réponses naturelles.");
  }
  if (/vercel|deploy|deployer|production/.test(q)) {
    actions.push("Tester localement avec npm run typecheck et npm run build, puis déployer sur Vercel uniquement après validation des scénarios critiques.");
  }
  if (/image|upload|vision/.test(q)) {
    actions.push("Conserver l’upload image actuel et préparer la vraie analyse vision serveur pour V91.");
  }
  if (!actions.length) {
    actions.push("Résumer l’état V90 du projet, identifier la décision la plus importante, puis proposer une prochaine action concrète.");
  }
  return unique(actions, 6);
}

function extractRisks(messages: MessageLike[]) {
  const recent = normalize(messages.slice(-16).map((m) => m.content).join(" "));
  const risks: string[] = [];
  if (/ne reponds plus|silence|adieu|mourir|tuer|faire du mal/.test(recent)) {
    risks.push("Le silence ne doit jamais bloquer une réponse de sécurité ou de crise.");
  }
  if (/deploiement|vercel|prod|production/.test(recent)) {
    risks.push("Éviter les micro-déploiements non testés sur la production.");
  }
  if (/memoire|memory/.test(recent)) {
    risks.push("La mémoire doit rester visible, contrôlable, modifiable et non intrusive.");
  }
  if (/image|upload|vision/.test(recent)) {
    risks.push("Ne pas prétendre analyser visuellement une image avant la livraison V91 serveur vision.");
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
    focus: projectContext.focus || V90_PROJECT_STATE.focus,
    decisions: unique([...V90_PROJECT_STATE.decisions, ...decisions], 8),
    nextActions: unique([...V90_PROJECT_STATE.nextActions, ...nextActions], 8),
    risks: unique([...V90_PROJECT_STATE.risks, ...risks], 6),
    confidence: "high"
  };
}

export function projectGuidance(snapshot: ProjectSnapshot) {
  return `
V90 Project Brain :
- Projet actif : ${snapshot.projectName}.
- Version/focus actuel : ${snapshot.currentVersion} — ${snapshot.focus}.
- Sources mémoire prioritaires : ${V90_PROJECT_STATE.prioritySources.join(" ; ")}.
- Décisions utiles : ${snapshot.decisions.slice(0, 5).join(" ; ")}.
- Prochaines actions probables : ${snapshot.nextActions.slice(0, 4).join(" ; ")}.
- Risques à surveiller : ${snapshot.risks.slice(0, 3).join(" ; ")}.
Quand l'utilisateur demande où en est le projet, la prochaine version, les décisions ou la roadmap, réponds avec l'état V90 actuel, pas avec les anciens jalons V74/V76.`;
}

export function projectIntelligenceReply(latestUser: string, snapshot: ProjectSnapshot) {
  const q = normalize(latestUser);
  const asksStatus = /\b(ou on en est|où on en est|etat du projet|point projet|resume le projet|resume projet|resume l etat actuel|résume l’état actuel|version actuelle|prochaine etape|prochaine version|roadmap|decisions prises|qu est ce qu on fait maintenant|sur quoi on bosse|continue le projet)\b/.test(q);
  if (!asksStatus) return null;

  const decisions = snapshot.decisions.slice(0, 5).map((d) => `- ${d}`).join("\n");
  const actions = snapshot.nextActions.slice(0, 5).map((a) => `- ${a}`).join("\n");
  const risks = snapshot.risks.slice(0, 4).map((r) => `- ${r}`).join("\n");

  return {
    intent: "project-intelligence",
    content: `On est sur **${snapshot.projectName} ${snapshot.currentVersion} — ${V90_PROJECT_STATE.codename}**.

Le cap actuel : ${snapshot.focus}.

**Mémoire projet prioritaire**
- ${V90_PROJECT_STATE.prioritySources.join("\n- ")}

**Décisions importantes retenues**
${decisions}

**Prochaines actions recommandées**
${actions}

**Points de vigilance**
${risks}

**Vision serveur**
L’upload image reste conservé côté interface. L’analyse visuelle côté serveur est prévue pour **V91**, donc Nimbray doit rester honnête : il reçoit l’image, mais ne prétend pas encore l’observer directement.

Ma recommandation : finaliser ce polish V90, valider les trois tests produit attendus, puis ouvrir la PR vers main.`
  };
}

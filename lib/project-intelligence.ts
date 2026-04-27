import { V91_PROJECT_MEMORY } from "./project-memory";

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
  if (!matches.length) return V91_PROJECT_MEMORY.workingVersion;
  const last = matches.reduce((best, item) => Number(item[1]) > Number(best[1]) ? item : best, matches[0]);
  return `V${last[1]}${last[2] ? `.${last[2]}` : ""}`;
}

function extractDecisionCandidates(messages: MessageLike[], memory: string[]) {
  const joined = [...memory, ...messages.slice(-14).map((m) => m.content)].join("\n");
  const lines = joined.split(/\n|\. /g).map((x) => x.trim()).filter(Boolean);
  return unique(lines.filter((line) => {
    const q = normalize(line);
    return /\b(decision|decide|on decide|on garde|on part sur|on passe|priorite|strategie|roadmap|version|deployer|deploiement|vercel|zip|safety|securite|silence|memoire|projet)\b/.test(q);
  }), 10);
}

function extractNextActions(messages: MessageLike[], latestUser: string) {
  const text = `${messages.slice(-10).map((m) => m.content).join("\n")}\n${latestUser}`;
  const q = normalize(text);
  const actions: string[] = [];

  if (/v71\.3|contextual safety|adieu|securite contextuelle/.test(q)) {
    actions.push("Valider que V71.3 répond bien aux signaux de danger contextuels, même après une demande de silence.");
  }
  if (/v91|v90|memoire|memory|project intelligence|projet/.test(q)) {
    actions.push("Finaliser V91 autour de la mémoire projet prioritaire, du naturel des réponses et du fallback vision honnête.");
  }
  if (/vercel|deploy|deployer|production/.test(q)) {
    actions.push("Tester localement avec npm run build, puis déployer sur Vercel uniquement après validation des scénarios critiques.");
  }
  if (!actions.length) {
    actions.push("Résumer l’état du projet, identifier la décision la plus importante, puis proposer une prochaine action concrète.");
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
  const inferredVersion = inferLatestVersion(text);
  const currentVersion = Number(inferredVersion.replace(/\D/g, "") || "0") < 90 ? V91_PROJECT_MEMORY.workingVersion : inferredVersion;

  const decisions = extractDecisionCandidates(params.messages, memory);
  const nextActions = extractNextActions(params.messages, params.latestUser);
  const risks = extractRisks(params.messages);

  return {
    projectName: projectContext.projectName || "NimbrayAI",
    currentVersion,
    focus: projectContext.focus || V91_PROJECT_MEMORY.phase,
    decisions: decisions.length ? decisions : V91_PROJECT_MEMORY.decisions.slice(0, 3),
    nextActions,
    risks: risks.length ? risks : V91_PROJECT_MEMORY.risks.slice(0, 3),
    confidence: decisions.length >= 3 ? "high" : decisions.length ? "medium" : "low"
  };
}

export function projectGuidance(snapshot: ProjectSnapshot) {
  return `
V91 Memory & Project Intelligence :
- Projet actif : ${snapshot.projectName}.
- Version/focus détecté : ${snapshot.currentVersion} — ${snapshot.focus}.
- Décisions utiles : ${snapshot.decisions.slice(0, 5).join(" ; ")}.
- Prochaines actions probables : ${snapshot.nextActions.slice(0, 4).join(" ; ")}.
- Risques à surveiller : ${snapshot.risks.slice(0, 3).join(" ; ")}.
Quand l'utilisateur demande où en est le projet, la prochaine version, les décisions ou la roadmap, réponds comme un copilote projet : clair, synthétique, concret, sans inventer de faux historique et sans confondre les archives anciennes avec l’état V91 de travail.`;
}

export function projectIntelligenceReply(latestUser: string, snapshot: ProjectSnapshot) {
  const q = normalize(latestUser);
  const asksStatus = /\b(ou on en est|où on en est|etat du projet|point projet|resume le projet|resume projet|version actuelle|prochaine etape|prochaine version|roadmap|decisions prises|qu est ce qu on fait maintenant|sur quoi on bosse|continue le projet)\b/.test(q);
  if (!asksStatus) return null;

  const decisions = snapshot.decisions.slice(0, 5).map((d) => `- ${d}`).join("\n");
  const actions = snapshot.nextActions.slice(0, 5).map((a) => `- ${a}`).join("\n");
  const risks = snapshot.risks.slice(0, 4).map((r) => `- ${r}`).join("\n");

  return {
    intent: "project-intelligence",
    content: `On est sur **${snapshot.projectName} ${snapshot.currentVersion}**.

Le cap actuel : ${snapshot.focus}.

**Décisions importantes retenues**
${decisions}

**Prochaines actions recommandées**
${actions}

**Points de vigilance**
${risks}

Ma recommandation : on avance par grosse version stable, on teste les scénarios critiques, puis on déploie seulement quand le saut de qualité est clair.`
  };
}

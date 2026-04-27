export type PolishOptions = {
  responseMode?: string;
  sourceRequested?: boolean;
  intent?: string | null;
};

type MessageLike = { role: string; content: string };

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sentenceCount(text: string) {
  return String(text || "").split(/[.!?。！？]+/).map((x) => x.trim()).filter(Boolean).length;
}

function recentAssistantText(messages: MessageLike[], count = 5) {
  return messages
    .filter((m) => m.role === "assistant")
    .slice(-count)
    .map((m) => normalize(m.content))
    .join(" | ");
}

function stripRoboticOpeners(content: string) {
  let out = content.trim();
  const openers: RegExp[] = [
    /^bien sûr[,.!]?\s*/i,
    /^absolument[,.!]?\s*/i,
    /^j[’']ai compris[^.?!]*[.?!]?\s*/i,
    /^je suis là pour t[’' ]aider[,.!]?\s*/i,
    /^je suis là si tu as besoin[,.!]?\s*/i,
    /^comment puis-je t[’' ]aider\s*\??\s*/i,
    /^n[’']hésite pas à me demander[^.?!]*[.?!]?\s*/i,
    /^n[’']hésite pas[^.?!]*[.?!]?\s*/i,
    /^je reste disponible[^.?!]*[.?!]?\s*/i,
    /^voici une réponse (claire|structurée|détaillée)[^:]*:\s*/i,
  ];
  for (const opener of openers) out = out.replace(opener, "");
  return out.trim();
}

function reduceRepeatedClosers(content: string, recentAssistant: string) {
  let out = content;
  const repeatedTone = recentAssistant.includes("je reste disponible")
    || recentAssistant.includes("je suis la")
    || recentAssistant.includes("hesite pas")
    || recentAssistant.includes("comment puis je");

  const closers = [
    /\n?\s*Je reste disponible\.?\s*$/i,
    /\n?\s*N[’']hésite pas si tu as d[’']autres questions\.?\s*$/i,
    /\n?\s*Dis-moi si tu veux que je développe\.?\s*$/i,
    /\n?\s*Si tu veux, je peux t[’']aider à aller plus loin\.?\s*$/i,
    /\n?\s*Je suis là si tu as besoin\.?\s*$/i,
    /\n?\s*Je suis là pour toi\.?\s*$/i,
  ];

  if (repeatedTone) {
    for (const closer of closers) out = out.replace(closer, "");
  }
  return out.trim();
}

function collapseDuplicateLines(content: string) {
  const seen = new Set<string>();
  const lines = content.split("\n");
  const kept: string[] = [];
  for (const line of lines) {
    const key = normalize(line);
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    kept.push(line);
  }
  return kept.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function removeUnaskedSourceSection(content: string, sourceRequested?: boolean) {
  if (sourceRequested) return content;
  return content
    .replace(/\n{1,2}#{0,3}\s*Sources utilisées\s*:?\s*[\s\S]*$/i, "")
    .replace(/\n{1,2}#{0,3}\s*Sources\s*:?\s*[\s\S]*$/i, "")
    .trim();
}

function softenOverpromises(content: string) {
  return content
    .replace(/\bje vais faire ça en arrière-plan\b/gi, "je peux te donner la marche à suivre ici")
    .replace(/\bje m'en occupe plus tard\b/gi, "on peut le préparer maintenant")
    .replace(/\bje vais tout faire automatiquement\b/gi, "je peux préparer une version exploitable");
}

function makeNextStepsSharper(content: string, intent?: string | null) {
  if (!intent || !/project|expert|orchestration|agent/i.test(intent)) return content;
  if (/prochaine[s]? étape[s]?|tests?|pull request|pr vers main/i.test(content)) return content;
  return `${content.trim()}\n\n**Prochaine étape claire**\nPréparer les fichiers modifiés, lancer les checks disponibles, puis ouvrir la PR vers \`main\` depuis la branche agent.`;
}

export function buildV87StyleGuidance() {
  return `
V87 Natural Product Brain :
- Réponds avec une voix Nimbray plus vivante : directe, chaleureuse, utile, jamais mécanique.
- Varie les débuts et les fins ; évite les automatismes comme "je suis là", "je reste disponible", "comment puis-je t'aider" et "n'hésite pas".
- Pour une demande simple, donne une réponse simple. Pour un chantier projet, donne une décision, les fichiers/étapes, les risques et les tests.
- Pour un message personnel ou émotionnel, commence par accueillir l'émotion, puis propose une petite étape concrète sans dramatiser.
- Quand plusieurs agents internes sont concernés, orchestre Produit, IA, Backend et Frontend en une synthèse commune au lieu de produire quatre blocs redondants.
- Les prochaines étapes doivent être nettes : maintenant, à tester, puis PR/merge si c'est un chantier projet.
- Ne promets pas de capacités non livrées : explique sobrement les limites et propose l'étape faisable.
- Conserve le tutoiement, une énergie positive, et une seule question de relance maximum.
- Préserve la sécurité : les sujets de détresse, santé, droit, finance et danger passent avant le style.
`;
}

export function buildV85StyleGuidance() {
  return buildV87StyleGuidance();
}

export function polishNimbrayResponse(content: string, latestUser: string, messages: MessageLike[] = [], options: PolishOptions = {}) {
  let out = String(content || "").trim();
  if (!out) return out;

  const q = normalize(latestUser);
  const recentAssistant = recentAssistantText(messages);

  out = stripRoboticOpeners(out);
  out = reduceRepeatedClosers(out, recentAssistant);
  out = collapseDuplicateLines(out);
  out = removeUnaskedSourceSection(out, options.sourceRequested);
  out = softenOverpromises(out);
  out = makeNextStepsSharper(out, options.intent);

  const isMicro = q.split(" ").filter(Boolean).length <= 3;
  if (isMicro && sentenceCount(out) > 2 && !/(mourir|suicide|danger|seul|seule|peur|urgence|mal)/.test(q)) {
    out = out.match(/[^.!?]+[.!?]?/g)?.slice(0, 2).join(" ").trim() || out;
  }

  if (recentAssistant.includes("comment tu vas") && /^comment tu vas/i.test(out)) {
    out = out.replace(/^comment tu vas aujourd[’']hui\s*\??\s*/i, "Tu veux avancer sur quoi aujourd’hui ? ");
  }

  return out.trim() || content;
}

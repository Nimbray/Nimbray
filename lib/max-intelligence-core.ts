export type MaxDomain =
  | "cooking"
  | "code"
  | "project"
  | "business"
  | "writing"
  | "learning"
  | "daily_life"
  | "health"
  | "legal"
  | "finance"
  | "creative"
  | "conversation"
  | "general";

export type MaxProfile = {
  domain: MaxDomain;
  taskType:
    | "answer"
    | "plan"
    | "recipe"
    | "debug"
    | "write"
    | "explain"
    | "compare"
    | "decide"
    | "summarize"
    | "brainstorm"
    | "project_status"
    | "conversation";
  requiredTerms: string[];
  mustKeep: string[];
  qualityLevel: "normal" | "strong" | "max";
  answerStyle: "short" | "balanced" | "structured" | "expert";
  risk: "normal" | "sensitive" | "high_stakes";
  confidence: "low" | "medium" | "high";
};

export type MaxReply = {
  intent: string;
  content: string;
  confidence: "medium" | "high";
};

type ChatMessage = { role: string; content: string };

function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9\s\-\.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function clean(text: string) {
  return String(text || "").trim();
}

function words(q: string) {
  return q.split(/\s+/).filter(Boolean);
}

function includesAny(q: string, terms: string[]) {
  return terms.some((term) => q.includes(normalize(term)));
}

function hasWord(q: string, word: string) {
  const escaped = normalize(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(q);
}

function unique(items: string[], max = 16) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of items.map((x) => normalize(x).trim()).filter(Boolean)) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
    if (out.length >= max) break;
  }
  return out;
}

function extractQuoted(text: string) {
  return Array.from(String(text || "").matchAll(/["“”«»]([^"“”«»]{2,80})["“”«»]/g)).map((m) => m[1]);
}

function extractAfter(q: string, prep: string) {
  const pattern = new RegExp(`\\b${prep}\\s+(?:de la |du |des |de l |d |un |une |le |la |les |mon |ma |mes |ton |ta |tes )?([a-z0-9\\- ]{2,70})`, "i");
  const match = q.match(pattern);
  if (!match) return null;
  return match[1]
    .replace(/\b(pour|sans|et|ou|mais|dans|sur|au|aux|avec|comme|simple|rapide|facile|stp|svp|merci|maintenant)\b.*$/i, "")
    .trim();
}

function detectDomain(q: string): MaxDomain {
  if (includesAny(q, ["recette", "cuisine", "repas", "plat", "ingredient", "ingrédient", "frites", "pates", "pâtes", "poulet", "jambon", "oeuf", "œuf", "gateau", "gâteau"])) return "cooking";
  if (includesAny(q, ["bug", "erreur", "stack trace", "typescript", "javascript", "python", "react", "next", "vercel", "npm", "build", "api", "fonction", "component", "composant"])) return "code";
  if (includesAny(q, ["nimbray", "projet", "version", "roadmap", "deploiement", "déploiement", "release", "v90", "v91", "v70", "v71", "v72", "v73", "v74", "sprint"])) return "project";
  if (includesAny(q, ["business", "client", "vente", "marketing", "startup", "offre", "prix", "prospection", "positionnement", "concurrent"])) return "business";
  if (includesAny(q, ["ecris", "écris", "redige", "rédige", "reformule", "corrige ce texte", "mail", "email", "lettre", "post", "message"])) return "writing";
  if (includesAny(q, ["explique", "apprendre", "cours", "definition", "définition", "pourquoi", "comment ca marche", "comment ça marche", "resume", "résume"])) return "learning";
  if (includesAny(q, ["organise", "planning", "todo", "to do", "liste", "routine", "menage", "ménage", "course", "courses", "quotidien"])) return "daily_life";
  if (includesAny(q, ["sante", "santé", "douleur", "symptome", "symptôme", "medecin", "médecin", "medicament", "médicament"])) return "health";
  if (includesAny(q, ["droit", "legal", "légal", "avocat", "plainte", "justice", "tribunal", "contrat", "cgu"])) return "legal";
  if (includesAny(q, ["budget", "economie", "économie", "investir", "finance", "argent", "credit", "crédit", "banque"])) return "finance";
  if (includesAny(q, ["idee", "idée", "creatif", "créatif", "histoire", "logo", "nom", "slogan", "concept", "scenario", "scénario"])) return "creative";
  if (words(q).length <= 5) return "conversation";
  return "general";
}

function detectTask(q: string): MaxProfile["taskType"] {
  if (includesAny(q, ["recette", "plat", "repas"])) return "recipe";
  if (includesAny(q, ["bug", "erreur", "debug", "corrige le code", "build", "npm run build"])) return "debug";
  if (includesAny(q, ["plan", "roadmap", "strategie", "stratégie", "etapes", "étapes", "programme"])) return "plan";
  if (includesAny(q, ["ecris", "écris", "redige", "rédige", "reformule"])) return "write";
  if (includesAny(q, ["explique", "definition", "définition", "comment ca marche", "comment ça marche", "pourquoi"])) return "explain";
  if (includesAny(q, ["compare", "difference", "différence", " vs ", "versus"])) return "compare";
  if (includesAny(q, ["choisir", "choix", "tu me conseilles", "meilleur", "recommande"])) return "decide";
  if (includesAny(q, ["resume", "résume", "synthese", "synthèse"])) return "summarize";
  if (includesAny(q, ["idee", "idée", "brainstorm", "invente"])) return "brainstorm";
  if (includesAny(q, ["ou on en est", "où on en est", "prochaine etape", "prochaine étape", "version actuelle"])) return "project_status";
  if (words(q).length <= 5) return "conversation";
  return "answer";
}

function detectQuality(q: string): MaxProfile["qualityLevel"] {
  if (includesAny(q, ["maximum", "met le paquet", "donne tout", "comme un expert", "meilleur", "plus forte", "puissante", "grosse version", "acharne", "acharné"])) return "max";
  if (includesAny(q, ["complet", "detaille", "détaillé", "solide", "pro", "professionnel", "avance", "avancé"])) return "strong";
  return "normal";
}

function detectStyle(q: string): MaxProfile["answerStyle"] {
  if (includesAny(q, ["court", "rapide", "sans blabla", "juste la reponse", "juste la réponse"])) return "short";
  if (includesAny(q, ["expert", "technique", "profond", "maximum", "met le paquet", "complet"])) return "expert";
  if (includesAny(q, ["liste", "tableau", "structure", "plan", "etapes", "étapes"])) return "structured";
  return "balanced";
}

function detectRisk(q: string, domain: MaxDomain): MaxProfile["risk"] {
  if (domain === "health" || domain === "legal" || domain === "finance") return "high_stakes";
  if (includesAny(q, ["securite", "sécurité", "urgence", "danger", "risque", "menace", "plainte"])) return "sensitive";
  return "normal";
}

function extractRequiredTerms(text: string) {
  const q = normalize(text);
  const terms: string[] = [];
  const known = [
    "frites", "jambon", "poulet", "pates", "pâtes", "riz", "fromage", "oeufs", "œufs", "vegetarien", "végétarien",
    "vercel", "next", "nextjs", "react", "typescript", "javascript", "python", "npm", "build", "api",
    "nimbrayai", "v90", "v91", "v71", "v72", "v73", "v74", "memoire", "mémoire", "projet", "securite", "sécurité",
    "silence", "quality", "qualite", "qualité", "cerveau", "connaissances", "zip"
  ];
  for (const term of known) if (hasWord(q, term)) terms.push(term);
  for (const prep of ["avec", "sans", "sur"]) {
    const item = extractAfter(q, prep);
    if (item && item.length <= 65) terms.push(`${prep} ${item}`);
  }
  terms.push(...extractQuoted(text));
  return unique(terms, 14);
}

export function analyzeMaxIntelligence(text: string, messages: ChatMessage[] = []): MaxProfile {
  const q = normalize(text);
  const domain = detectDomain(q);
  const taskType = detectTask(q);
  const requiredTerms = extractRequiredTerms(text);
  const qualityLevel = detectQuality(q);
  const answerStyle = detectStyle(q);
  const risk = detectRisk(q, domain);
  const mustKeep = requiredTerms.map((x) => x.replace(/^(avec|sur|sans)\s+/, "")).filter((x) => x.length >= 2);
  const confidence = domain !== "general" || requiredTerms.length || qualityLevel !== "normal" ? "high" : "medium";
  return { domain, taskType, requiredTerms, mustKeep, qualityLevel, answerStyle, risk, confidence };
}

function cookingReply(profile: MaxProfile, text: string): MaxReply | null {
  if (profile.domain !== "cooking") return null;
  const q = normalize(text);
  const ingredientTerms = profile.mustKeep
    .map((x) => x.replace(/\b(avec|sans|sur)\b/g, "").trim())
    .filter((x) => !["recette", "plat", "repas", "cuisine"].includes(x))
    .slice(0, 4);

  if (!includesAny(q, ["recette", "plat", "repas", "idee", "idée", "cuisine"])) return null;

  if (hasWord(q, "frites")) {
    return {
      intent: "v90-quality-cooking-fries-constraint-locked",
      confidence: "high",
      content: `Oui — je te donne une recette où les **frites** restent au centre.

## Frites gratinées façon loaded fries

**Ingrédients**
- Frites bien croustillantes
- Fromage râpé ou cheddar
- Oignons frits ou oignon rouge
- Sauce au choix : cheddar, blanche, barbecue ou poivre
- Paprika, poivre, herbes
- Option : poulet, jambon, champignons ou légumes grillés

**Préparation**
1. Fais cuire les frites jusqu’à ce qu’elles soient vraiment croustillantes.
2. Mets-les dans un plat ou une assiette qui passe au four.
3. Ajoute le fromage et la garniture.
4. Passe 5 à 8 minutes au four à 200 °C pour faire fondre.
5. Ajoute la sauce à la fin pour garder les frites croustillantes.

Résultat : un plat simple, gourmand, et surtout basé sur les frites — pas une recette qui part sur autre chose.`
    };
  }

  const main = ingredientTerms.length ? ingredientTerms.join(", ") : "ce que tu as sous la main";
  return {
    intent: "v90-quality-cooking-generic-constraint-locked",
    confidence: "medium",
    content: `Oui — je garde ta contrainte principale : **${main}**.

## Idée de recette simple

**Principe**
Utilise **${main}** comme base du plat, puis ajoute :
- une source de goût : épices, ail, oignon, herbes ou sauce ;
- une texture : fromage, chapelure, légumes croquants ou cuisson au four ;
- un accompagnement : salade, riz, pâtes, pommes de terre ou pain.

**Méthode rapide**
1. Prépare l’ingrédient principal.
2. Assaisonne bien : sel léger, poivre, paprika ou herbes.
3. Ajoute une sauce ou un élément fondant si tu veux un plat plus gourmand.
4. Termine par une cuisson courte à la poêle ou au four.

Si tu me donnes 2 ou 3 ingrédients que tu as, je te fais une vraie recette précise avec quantités.`
  };
}

function codeBuildReply(profile: MaxProfile, text: string): MaxReply | null {
  const q = normalize(text);
  if (profile.domain !== "code" && !includesAny(q, ["vercel", "npm", "build"])) return null;
  if (!includesAny(q, ["erreur", "bug", "build", "npm run build", "vercel", "deploy", "deploiement", "déploiement"])) return null;

  return {
    intent: "v90-quality-code-debug-deploy",
    confidence: "medium",
    content: `On va le traiter proprement, comme un bug de déploiement.

## Méthode rapide

1. **Lire la première vraie erreur**
   Cherche dans le terminal : \`Failed to compile\`, \`Type error\`, \`Module not found\`, \`Syntax error\` ou \`Build failed\`.

2. **Ne pas corriger au hasard**
   Ne lance pas \`npm audit fix --force\` pour régler un build : ça peut casser les dépendances.

3. **Vérifier les fichiers modifiés**
   Les erreurs viennent souvent de :
   - import manquant ;
   - export mal nommé ;
   - accolade oubliée ;
   - type TypeScript incorrect ;
   - fichier déplacé ;
   - variable d’environnement absente.

4. **Commande locale**
   \`\`\`powershell
   npm install
   npm run build
   \`\`\`

5. **Déploiement seulement après build réussi**
   \`\`\`powershell
   vercel --prod
   \`\`\`

Colle-moi le bloc à partir de \`Failed to compile\` ou \`Type error\`, et je te dis exactement quoi corriger.`
  };
}

function projectAiReply(profile: MaxProfile, text: string): MaxReply | null {
  const q = normalize(text);
  if (profile.domain !== "project") return null;
  if (!includesAny(q, ["ameliorer", "améliorer", "evoluer", "évoluer", "max", "maximum", "plus forte", "puissante", "prochaine grosse", "version", "ia"])) return null;

  return {
    intent: "v90-quality-project-ai-strategy",
    confidence: "high",
    content: `La direction la plus forte, c’est de faire évoluer NimbrayAI comme une vraie architecture IA, pas comme un simple chatbot.

## Priorité immédiate

**V90 — Final Polish / Quality Core**

Objectif : stabiliser le cœur actuel avant PR :
- compréhension plus stricte des demandes ;
- verrouillage des contraintes ;
- quality gate final ;
- connaissances internes enrichies ;
- sécurité prioritaire ;
- meilleure logique projet ;
- réponses moins naïves et plus adultes.

## Architecture cible

\`\`\`text
Message utilisateur
→ sécurité prioritaire
→ intention réelle
→ contraintes obligatoires
→ contexte projet / mémoire
→ moteur spécialisé
→ modèle IA si nécessaire
→ quality gate final
→ réponse propre
\`\`\`

Le vrai bond vient du trio : **raisonnement + contraintes + qualité finale**.`
  };
}

function decisionReply(profile: MaxProfile): MaxReply | null {
  if (profile.taskType !== "decide") return null;
  return {
    intent: "v90-decision-framework",
    confidence: "medium",
    content: `Pour choisir intelligemment, compare sur 5 critères :

1. **Impact** : qu’est-ce qui change vraiment ?
2. **Risque** : qu’est-ce qui peut mal tourner ?
3. **Coût** : temps, argent, énergie.
4. **Réversibilité** : est-ce facile à annuler ?
5. **Priorité** : est-ce important maintenant ou plus tard ?

La bonne décision est souvent celle qui a **fort impact, risque maîtrisé, coût acceptable, et retour arrière possible**.

Donne-moi les options, et je te fais un classement clair avec recommandation.`
  };
}

export function maxIntelligenceReply(text: string, messages: ChatMessage[] = []): MaxReply | null {
  const profile = analyzeMaxIntelligence(text, messages);
  return (
    cookingReply(profile, text) ||
    codeBuildReply(profile, text) ||
    projectAiReply(profile, text) ||
    decisionReply(profile)
  );
}

export function maxIntelligenceGuidance(profile: MaxProfile) {
  const required = profile.requiredTerms.length ? profile.requiredTerms.join(", ") : "aucune contrainte explicite forte";
  const mustKeep = profile.mustKeep.length ? profile.mustKeep.join(", ") : "le sujet principal de la demande";
  return `
V90 Quality Core :
- Domaine : ${profile.domain}. Type de tâche : ${profile.taskType}. Style : ${profile.answerStyle}. Niveau qualité : ${profile.qualityLevel}. Risque : ${profile.risk}.
- Contraintes détectées : ${required}. Éléments à conserver : ${mustKeep}.
- Comprends d'abord l'intention réelle de l'utilisateur, puis réponds à cette intention sans dériver.
- Si l'utilisateur donne un élément obligatoire ("avec X", "sans Y", une version, un outil, un ingrédient, un fichier, une commande), verrouille-le dans la réponse.
- Ne propose jamais une solution voisine qui oublie l'élément central.
- Réponds comme une IA adulte : diagnostic bref, solution concrète, étapes utiles, limites quand nécessaire.
- Pour une demande simple, donne une réponse immédiatement exploitable. Pour une demande ambitieuse, structure en plan clair.
- Pour code/déploiement : ne devine pas l'erreur, demande le bloc exact si nécessaire, et privilégie les corrections minimales.
- Pour santé/droit/finance : reste prudent, indique les limites, et recommande un professionnel quand l'enjeu est important.
- Pour projet NimbrayAI : pense produit IA en production : sécurité, mémoire, qualité, versioning, tests, déploiement.
- Avant de finaliser, vérifie : réponse alignée, contrainte respectée, pas de hors-sujet, pas de remplissage, pas de ton enfantin.`;
}

function hasRequiredTerm(response: string, term: string) {
  const r = normalize(response);
  const t = normalize(term).replace(/^(avec|sur|sans)\s+/, "").trim();
  if (!t || t.length < 2) return true;
  if (t === "pates") return /\b(pate|pates|pasta)\b/.test(r);
  if (t === "frites") return /\b(frite|frites|pommes de terre frites)\b/.test(r);
  if (t === "oeufs") return /\b(oeuf|oeufs)\b/.test(r);
  return r.includes(t) || t.split(/\s+/).some((part) => part.length > 4 && r.includes(part));
}

function removeWeakPhrases(content: string) {
  let out = clean(content);
  const replacements: Array<[RegExp, string]> = [
    [/\bJe reste disponible\.?/gi, ""],
    [/\bN'hésitez pas à me solliciter\.?/gi, ""],
    [/\bEn tant qu'?IA[, ]+/gi, ""],
    [/^Bien sûr,?\s+je peux t'aider\s*:?\s*/i, ""],
    [/^Voici une réponse possible\s*:?\s*/i, ""],
    [/^J'ai compris ta demande\s*:?\s*/i, ""]
  ];
  for (const [pattern, value] of replacements) out = out.replace(pattern, value);
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

function looksTooWeak(content: string, profile: MaxProfile) {
  const q = normalize(content);
  if (profile.taskType === "conversation") return false;
  if (content.trim().length < 90 && profile.answerStyle !== "short") return true;
  if (/^(ok|d accord|bien sur|voila)\.?$/i.test(content.trim())) return true;
  if (q.includes("je peux vous aider") && q.length < 220) return true;
  return false;
}

function fallbackConstraintRepair(profile: MaxProfile, latestUser: string) {
  const must = profile.mustKeep.slice(0, 5).join(", ") || "ta contrainte principale";
  if (profile.domain === "cooking" && profile.mustKeep.some((x) => normalize(x).includes("frites"))) {
    const reply = cookingReply(profile, latestUser);
    if (reply) return reply.content;
  }
  return `Je corrige pour respecter précisément ta demande.

Contrainte à garder : **${must}**.

Réponse recentrée :
1. je garde le sujet principal ;
2. je conserve l’élément obligatoire ;
3. je ne remplace pas ta demande par une idée voisine ;
4. je donne une solution concrète.

Renvoie-moi la phrase ou le contexte exact si tu veux une version complète immédiatement exploitable.`;
}

export function maxIntelligenceQualityGate(content: string, latestUser: string, messages: ChatMessage[] = []) {
  const profile = analyzeMaxIntelligence(latestUser, messages);
  let out = removeWeakPhrases(content);
  if (!out) return out;

  const lowerUser = normalize(latestUser);
  const lowerOut = normalize(out);

  // Ne pas réécrire les réponses de sécurité/crise.
  if (/(112|17|3114|urgence|suicide|faire du mal|te faire du mal|danger immediat|danger immédiat)/.test(lowerOut) && /(mourir|tuer|suicide|faire du mal|adieu|urgence)/.test(lowerUser)) {
    return out;
  }

  const required = profile.mustKeep.filter((x) => x.length >= 3).slice(0, 8);
  const missing = required.filter((term) => !hasRequiredTerm(out, term));
  if (missing.length && profile.confidence === "high") {
    return fallbackConstraintRepair(profile, latestUser);
  }

  if (looksTooWeak(out, profile)) {
    if (profile.qualityLevel === "max" || profile.answerStyle === "expert") {
      return `${out}

Pour pousser plus loin, il faut ajouter :
- un diagnostic clair ;
- des étapes concrètes ;
- les risques ou limites ;
- une recommandation finale ;
- un test ou une manière de vérifier le résultat.`;
    }
    return `${out}

Je peux aussi te donner une version plus structurée avec étapes concrètes.`;
  }

  return out;
}

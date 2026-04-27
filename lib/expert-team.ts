export type ExpertRole = "Produit" | "IA" | "Backend" | "Frontend";

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

function hasAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

export function detectExpertTeamRequest(latestUser: string, messages: MessageLike[] = []) {
  const q = normalize(latestUser);
  const recent = normalize(messages.slice(-8).map((m) => m.content).join(" "));
  const projectContext = hasAny(`${q} ${recent}`, [
    /\bnimbrayai\b/,
    /\bnotre ia\b/,
    /\bprojet ia\b/,
    /\bvercel\b/,
    /\bgroq\b/,
    /\bollama\b/,
    /\bsupabase\b/,
    /\bzip\b/,
    /\bsource\b/,
    /\bversion\b/,
    /\bfrontend\b/,
    /\bbackend\b/,
    /\bproduit\b/,
    /\bagent ia\b/,
    /\bagents internes?\b/,
    /\borchestration\b/,
    /\bpersonnalite\b/,
    /\brepetitions?\b/,
  ]);

  const teamRequest = hasAny(q, [
    /\bplusieurs experts?\b/,
    /\bensemble\b/,
    /\btous ensemble\b/,
    /\bchacun\b.*\bbosse/,
    /\btravailler\b.*\bensemble/,
    /\bbosser fort\b/,
    /\bavancer enormement\b/,
    /\brendre\b.*\breponses\b.*\bnaturelles?\b/,
    /\breduire\b.*\brepetitions?\b/,
    /\bameliore\b.*\bpersonnalite\b/,
    /\bameliore\b.*\bmessages emotionnels\b/,
    /\btous les aspects\b/,
    /\bmode commando\b/,
    /\bsprint\b/,
    /\broadmap\b/,
    /\bameliore\b.*\bprojet\b/,
    /\bbranche\b.*\bagent\b/,
    /\bmission v\d+\b/,
    /\bprepare\b.*\bpr\b/,
    /\bderniere version\b/,
  ]);

  return projectContext && teamRequest;
}

export function expertTeamGuidance() {
  return `
V87 Expert Team Orchestrator + Natural Product Brain :
- Pour le projet NimbrayAI, raisonne comme une équipe senior coordonnée : Produit, IA, Backend, Frontend.
- Produit protège la valeur utilisateur, la priorité et la clarté des prochaines étapes.
- IA protège le naturel, la mémoire projet, la vérité, la sécurité, les réponses personnelles et l’anti-répétition.
- Backend protège API, providers, uploads, erreurs, stockage, limites Vercel et contrat de réponse.
- Frontend protège interface, mobile, feedback visuel, accessibilité, fichiers et qualité perçue.
- Ne livre pas quatre avis isolés : fusionne en une décision, puis liste les tâches par rôle seulement quand cela aide.
- Pour une mission agent, termine par fichiers modifiés, tests et PR vers main.
- Priorité absolue : stabilité, utilité, simplicité, vitesse de livraison, compatibilité Vercel, CI vert, branche agent et handoff documenté.`;
}

export function expertTeamReply(latestUser: string, messages: MessageLike[] = []) {
  if (!detectExpertTeamRequest(latestUser, messages)) return null;

  return {
    intent: "expert-team-orchestration-v87",
    content: `On passe en **mode équipe V87** : une seule décision commune, puis des tâches nettes par rôle.

**Décision commune**
V87 doit rendre NimbrayAI plus naturel sans le rendre flou : moins de phrases automatiques, plus d’écoute dans les messages personnels, et des réponses projet qui disent clairement quoi faire ensuite.

**Sprint V87 — Natural Product Brain**

**Agent IA**
- Renforcer la personnalité Nimbray : chaleureux, direct, vivant, non répétitif.
- Mieux répondre aux messages personnels : solitude, doute, peur, honte, baisse d’énergie.
- Supprimer les réflexes comme “je suis là pour t’aider”, “je reste disponible” et les relances inutiles.

**Agent Produit**
- Garder la réponse orientée valeur : décision, priorité, prochaine étape.
- Pour les chantiers, expliquer “maintenant / à tester / PR vers main”.

**Agent Backend**
- Ne pas casser le contrat de réponse de \`app/api/chat/route.ts\`.
- Garder les erreurs propres et compatibles Vercel.

**Agent Frontend**
- Préparer des réponses assez claires pour être lisibles dans le chat mobile.
- Éviter les blocs trop longs quand l’utilisateur demande juste une réaction courte.

**Tests avant PR**
- Micro-dialogues : “bonjour”, “merci”, “rien”, “arrête”, “parle”.
- Personnel : “je me sens seul”, “je vais mal”, “je crois que je suis bi”.
- Projet : Backend, Frontend, IA, Produit, prochaines étapes.
- Checks : \`npm run source:check\`, \`npm run agent:merge-check\`, puis \`npm run build\` avec dépendances installées.

**PR prévue**
Branche : \`agent/ai/v87-natural-product-brain\` vers \`main\`, avec handoff IA et changelog à jour.`
  };
}

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
    /\bagent ia\b/,
  ]);

  const teamRequest = hasAny(q, [
    /\bplusieurs experts?\b/,
    /\bensemble\b/,
    /\btous ensemble\b/,
    /\bchacun\b.*\bbosse/,
    /\btravailler\b.*\bensemble/,
    /\bbosser fort\b/,
    /\bavancer enormement\b/,
    /\btous les aspects\b/,
    /\bmode commando\b/,
    /\bsprint\b/,
    /\broadmap\b/,
    /\bameliore\b.*\bprojet\b/,
    /\bremplace\b.*\bsource\b/,
    /\bsource\b.*\bevoluer\b/,
    /\bderniere version\b/,
  ]);

  return projectContext && teamRequest;
}

export function expertTeamGuidance() {
  return `
V84 Expert Team Orchestrator + GitHub Agent Automation :
- Pour le projet NimbrayAI, raisonne comme une équipe senior coordonnée : Produit, IA, Backend, Frontend.
- Produit choisit ce qui augmente vraiment la valeur utilisateur maintenant.
- IA améliore raisonnement, naturel, mémoire, vérité, sécurité et gestion des sources.
- Backend stabilise API, providers, uploads, erreurs, stockage, limites Vercel et sécurité.
- Frontend améliore interface, mobile, feedback visuel, accessibilité, fichiers et qualité perçue.
- Ne livre pas quatre avis isolés : fusionne en une décision, un sprint, des tâches concrètes et des critères de test.
- Pour une demande ambitieuse, produis : cap, chantier prioritaire, actions par rôle, risques, tests, prochaine version.
- Priorité absolue : stabilité, utilité, simplicité, vitesse de livraison, compatibilité Vercel, ZIP léger, dernière version comme source officielle, conversations du projet synchronisées et espace de travail séparé par agent/conversation, index CURRENT_SOURCE.json, GitHub Actions, Pull Requests, CODEOWNERS et commandes agent:start/agent:merge-check.`;
}

export function expertTeamReply(latestUser: string, messages: MessageLike[] = []) {
  if (!detectExpertTeamRequest(latestUser, messages)) return null;

  return {
    intent: "expert-team-orchestration",
    content: `Oui. On passe en **mode équipe d’experts V84** : on ne fait plus seulement des petits patchs, on organise NimbrayAI comme un vrai produit qui progresse vite sans devenir fragile.

**Décision commune**
On avance en sprint court avec 4 rôles synchronisés : Produit décide la priorité, IA améliore le cerveau, Backend solidifie le moteur, Frontend rend l’expérience premium.

**Synchronisation des conversations**
Toutes les conversations du projet IA peuvent apporter des idées, mais elles ne remplacent jamais la source active. On récupère les bonnes décisions, puis on les réapplique sur le dernier ZIP officiel pour éviter les régressions.

**Sprint V84 — GitHub multi-agents automatisé**

**Agent Produit**
- Transformer les idées en priorités : urgent, important, plus tard.
- Garder le cap : NimbrayAI doit être simple, utile, humaine, rapide et crédible.
- Éviter les fonctionnalités gadgets tant que le chat, l’upload, la mémoire et le cerveau ne sont pas solides.

**Agent IA**
- Renforcer les réponses projet : diagnostic, solution, test, prochaine action.
- Réduire les réponses robotiques et répétitives.
- Améliorer vérité, prudence, sources, mémoire et situations sensibles.
- Faire parler les agents ensemble sans afficher un rapport inutilement long.

**Agent Backend**
- Sécuriser les routes API chat, parse-doc, status, sync et les erreurs provider.
- Préparer une vraie architecture légère pour Vercel : local d’abord, Groq/OpenRouter/Ollama selon besoin.
- Stabiliser upload image/document, limites de taille, retours propres, fallback démo.
- Garder le ZIP léger : pas de dépendances lourdes inutiles.

**Agent Frontend**
- Améliorer l’expérience chat : pièces jointes visibles, états de chargement, erreurs claires, mobile propre.
- Rendre le panneau Cerveau plus lisible avec les agents, capacités et tests.
- Polir les micro-interactions pour que NimbrayAI paraisse plus premium.

**Risques à surveiller**
- Ajouter trop de choses sans tests.
- Faire grossir le cerveau au point de ralentir ou diluer les réponses.
- Promettre une vision image complète alors que le serveur ne l’analyse pas encore.
- Casser la compatibilité Vercel avec des modules trop lourds.

**Tests obligatoires avant livraison**
1. Message simple : “bonjour”, “merci”, “rien”, “arrête”, “parle”.
2. Message émotionnel : solitude, doute, orientation personnelle, détresse.
3. Projet : “améliore notre IA”, “corrige ce bug”, “où on en est ?”.
4. Upload image : sélection, aperçu, envoi, réponse honnête.
5. Upload document : TXT, MD, PDF/DOCX si dépendances disponibles.
6. Build : npm install puis npm run build.

**Prochaine version logique**
La V84 devient la version **GitHub Agent Automation** : elle conserve V83 Auto Source Sync, puis ajoute GitHub Actions, Pull Request template, CODEOWNERS, AGENT_CHANGELOG.json et les scripts agent:start, agent:handoff, agent:changelog et agent:merge-check.`
  };
}

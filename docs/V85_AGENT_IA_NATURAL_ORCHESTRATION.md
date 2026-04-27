# NimbrayAI V85 — Agent IA Natural Orchestration

## Objectif

V85 améliore le cœur conversationnel de NimbrayAI sans casser l’architecture V84 GitHub Agent Automation. Le but est de rendre les réponses plus naturelles, moins répétitives et plus cohérentes avec le contexte du projet IA.

## Changements IA

- Ajout d’une couche `lib/response-polish.ts` pour nettoyer les formulations robotiques, réduire les répétitions et supprimer les sections sources quand l’utilisateur ne les demande pas.
- Injection d’un guidage V85 dans le prompt système via `buildV85StyleGuidance()`.
- Application du post-traitement V85 sur les réponses locales, les réponses de sécurité, les réponses projet, les réponses orchestrateur et les réponses provider.
- Amélioration des micro-dialogues dans `lib/natural-intelligence.ts` pour varier les salutations, les remerciements et les relances.
- Renforcement du contexte projet dans `lib/project-intelligence.ts` : V84 reste la source de départ, V85 devient le chantier Agent IA proposé.
- Mise à jour de `lib/expert-team.ts` pour mieux détecter les demandes liées à la personnalité, aux répétitions, au naturel et à l’orchestration des agents internes.
- Ajout de règles V85 dans `lib/brain.ts` pour fixer le comportement attendu de NimbrayAI.

## Comportement attendu

NimbrayAI doit :

- répondre directement sans phrases de remplissage ;
- varier ses débuts et fins de réponse ;
- éviter de répéter “je suis là”, “je reste disponible” ou “comment puis-je t’aider” ;
- garder une voix claire, chaleureuse, énergique et fiable ;
- ne pas promettre des capacités non implémentées ;
- coordonner les agents internes en une décision commune avant de détailler par rôle ;
- rester prudente sur les sujets sensibles.

## Fichiers touchés

- `app/api/chat/route.ts`
- `lib/response-polish.ts`
- `lib/natural-intelligence.ts`
- `lib/project-intelligence.ts`
- `lib/expert-team.ts`
- `lib/brain.ts`
- `project-workspaces/03_agent-ia/HANDOFF_IA_V85_natural-orchestration.md`
- `project-workspaces/03_agent-ia/BRAIN_WORKLOG.md`
- `AGENT_CHANGELOG.json`

## Tests recommandés

1. `npm run source:check`
2. `npm run agent:merge-check`
3. `npm run build`
4. Tester les messages courts : `bonjour`, `merci`, `rien`, `arrête`, `parle`.
5. Tester les critiques : `trop robot`, `plus naturel`, `c’est faux`, `fais plus court`.
6. Tester les demandes projet : `où on en est ?`, `améliore notre IA`, `réduis les répétitions`, `orchestration des agents internes`.
7. Tester les sujets sensibles pour vérifier que le style ne passe jamais avant la sécurité.

## Limites

- V85 n’ajoute pas encore de vraie vision serveur.
- V85 ne remplace pas les providers externes ; elle améliore l’orchestration et la qualité autour d’eux.
- L’intégrateur reste responsable de la promotion officielle dans `CURRENT_SOURCE.json`.

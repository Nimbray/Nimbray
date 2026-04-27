# Handoff Agent IA — V87 Natural Product Brain

## Branche
`agent/ai/v87-natural-product-brain`

## Objectif
Améliorer la personnalité Nimbray pour obtenir des réponses plus naturelles, moins robotiques et moins répétitives, tout en renforçant les réponses personnelles, émotionnelles et projet.

## Changements réalisés

### Personnalité et anti-répétition
- Renforcement de `lib/response-polish.ts` avec les règles V87.
- Suppression plus agressive des débuts et fins automatiques : `je suis là pour t’aider`, `je reste disponible`, `n’hésite pas`, `comment puis-je t’aider`.
- Ajout d’une sortie projet plus nette quand une réponse agent manque de prochaine étape claire.

### Messages émotionnels/personnels
- Ajout d’un traitement local pour les messages comme `je vais mal`, `je suis triste`, `j’ai peur`, `je suis perdu`, `j’ai honte`.
- Réponses plus sobres : accueil de l’émotion, une seule petite étape, pas de dramatisation.
- Conservation de la priorité sécurité : la couche safety reste avant le naturel.

### Contexte projet IA
- Renforcement de `lib/project-intelligence.ts` pour les sujets Backend, Frontend, IA et Produit.
- Prochaines étapes explicites : branche agent, handoff, changelog, tests, PR vers `main`.
- Meilleure détection des risques CI, Vercel et coordination sur `app/api/chat/route.ts`.

### Orchestration agents internes
- Mise à jour de `lib/expert-team.ts` en V87.
- Décision commune avant les tâches par rôle.
- Réponses projet moins longues, plus exploitables, orientées sprint.

### Prompt cerveau
- Ajout des règles V87 dans `lib/brain.ts`.
- Passage de `app/api/chat/route.ts` vers `buildV87StyleGuidance()`.
- Nettoyage d’un message d’erreur Groq qui contenait encore `Je reste disponible`.

## Fichiers modifiés
- `app/api/chat/route.ts`
- `lib/response-polish.ts`
- `lib/natural-intelligence.ts`
- `lib/project-intelligence.ts`
- `lib/expert-team.ts`
- `lib/brain.ts`
- `lib/demo-engine.ts`
- `AGENT_CHANGELOG.json`
- `project-workspaces/03_agent-ia/HANDOFF_IA_V87_natural-product-brain.md`

## Tests effectués
- `npm run source:status`
- `npm run agent:start -- --agent ia --feature v87-natural-product-brain`
- `npm run source:check`
- `npm run agent:merge-check`
- Vérification syntaxique TypeScript ciblée via transpilation des fichiers modifiés.

## Tests à faire avant merge
- `npm install`
- `npm run build`
- Test manuel chat : `bonjour`, `merci`, `rien`, `arrête`, `parle`.
- Test manuel émotionnel : `je me sens seul`, `je vais mal`, `je crois que je suis bi`.
- Test manuel projet : demande Backend / Frontend / IA / Produit avec prochaines étapes.

## Risques
- Les branches Backend et Frontend peuvent modifier aussi `app/api/chat/route.ts` : prévoir une résolution de conflit côté intégrateur.
- Le build complet doit être lancé dans un environnement avec `node_modules` installé.

## PR proposée
Titre : `V87 Agent IA — Natural Product Brain`

Base : `main`

Branche : `agent/ai/v87-natural-product-brain`

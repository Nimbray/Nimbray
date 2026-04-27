# Handoff IA V85 — natural-orchestration

- Date : 2026-04-27
- Source de départ : 84.0.0 — V84 GitHub Agent Automation
- Branche conseillée : `agent/ai/v84-v85-natural-orchestration`
- Statut : prêt pour revue

## Objectif

Rendre NimbrayAI plus naturelle, moins répétitive, plus fidèle au contexte projet IA et mieux coordonnée entre agents internes, sans casser le CI ni modifier la source officielle `main`.

## Fichiers modifiés

- `app/api/chat/route.ts`
- `lib/response-polish.ts`
- `lib/natural-intelligence.ts`
- `lib/project-intelligence.ts`
- `lib/expert-team.ts`
- `lib/brain.ts`
- `docs/V85_AGENT_IA_NATURAL_ORCHESTRATION.md`
- `project-workspaces/03_agent-ia/BRAIN_WORKLOG.md`
- `AGENT_CHANGELOG.json`

## Changements réalisés

- Ajout d’un post-traitement V85 centralisé pour nettoyer les phrases robotiques, réduire les répétitions et éviter les sections sources non demandées.
- Application du polissage V85 aux réponses locales, sécurité, projet, orchestrateur, qualité, provider et image-upload.
- Ajout d’un guidage V85 dans le prompt système.
- Variation des micro-dialogues pour réduire les réponses mécaniques.
- Renforcement du contexte projet IA et de la détection des demandes liées aux agents internes.
- Documentation du chantier V85.

## Changements des autres agents pris en compte

- Frontend et Backend travaillent séparément sur l’upload image/fichier : V85 IA ne modifie pas l’UI ni les endpoints d’upload au-delà du message honnête côté chat.
- La source officielle reste V84/main ; l’intégrateur reste seul responsable de la promotion officielle.

## Risques

- Le post-traitement peut retirer une phrase de clôture utile si le provider répond de manière très courte.
- Les tests TypeScript/build n’ont pas pu être exécutés ici sans dépendances installées.
- Les agents Backend/Frontend devront vérifier que leurs branches ne modifient pas les mêmes sections de `app/api/chat/route.ts`.

## Tests effectués

- [x] `npm run source:status`
- [x] `npm run agent:start -- --agent ia --feature v85-natural-orchestration`
- [x] `npm run source:check`
- [x] `npm run agent:merge-check`
- [ ] `npm run build` — dépendances non installées dans l’environnement local
- [ ] Tests manuels chat complets sur navigateur

## Prêt pour intégration ?

- [x] Oui, sous réserve d’un `npm install` puis `npm run build` sur l’environnement GitHub/Vercel.

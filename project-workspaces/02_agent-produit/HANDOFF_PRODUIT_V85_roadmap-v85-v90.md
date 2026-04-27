# Handoff Produit V85 — Roadmap V85 à V90

- Date : 2026-04-27
- Source de départ : 84.0.0 — V84 GitHub Agent Automation
- Branche conseillée : `agent/product/v85-roadmap-v85-v90`
- Statut : prêt pour Pull Request

## Objectif

Créer un cadrage produit clair pour NimbrayAI V85 à V90 : priorités, critères d’acceptation, périmètre upload, cerveau IA, UX chat, déploiement et coordination multi-agents.

## Fichiers modifiés

- `project-workspaces/02_agent-produit/ROADMAP.md`
- `project-workspaces/02_agent-produit/NOTES.md`
- `project-workspaces/02_agent-produit/HANDOFF_PRODUIT_V85_roadmap-v85-v90.md`
- `AGENT_CHANGELOG.json`

## Changements réalisés

- Roadmap V85 à V90 structurée par version.
- Priorités produit définies : upload, UX chat, cerveau IA, déploiement, plateforme projet.
- Critères d’acceptation écrits pour chaque jalon.
- Backlog P0/P1/P2 préparé.
- Risques produit identifiés avec mitigations.
- Décisions V85 clarifiées pour éviter le scope creep.

## Changements des autres agents pris en compte

- Agent Backend : besoin de solidifier `app/api/chat/route.ts`, upload, erreurs et compatibilité Vercel.
- Agent Frontend : besoin de preview des pièces jointes, états visibles et amélioration mobile.
- Agent IA : besoin de réponses plus naturelles, moins répétitives et mieux contextualisées au projet IA.
- Agent Intégrateur : V84 impose branche agent, handoff, changelog, checks et PR vers `main`.

## Risques

- Les agents peuvent corriger chacun une partie de l’upload sans valider le parcours complet.
- L’ambition “cerveau IA maximal” peut pousser à annoncer des capacités non encore fiables.
- La documentation historique est abondante et peut contenir des promesses dépassées.
- Une refonte trop large en V85 pourrait casser le CI ou retarder la stabilisation.

## Tests effectués

- [x] Lecture des fichiers de référence demandés.
- [x] `npm run source:check`
- [x] `npm run agent:merge-check`
- [x] Vérification locale des fichiers modifiés.
- [ ] Test manuel upload réel côté interface/API — à faire par Frontend + Backend.
- [ ] Validation conversationnelle — à faire par Agent IA.

## Critères d’acceptation de la PR Produit

- La roadmap V85-V90 est lisible sans contexte externe.
- La V85 est cadrée comme stabilisation prioritaire.
- Les critères d’acceptation sont testables par les autres agents.
- Les risques et dépendances sont explicités.
- Le changelog agent contient l’entrée Produit.

## Commandes PR recommandées

```bash
git checkout main
git pull origin main
git checkout -b agent/product/v85-roadmap-v85-v90
git add project-workspaces/02_agent-produit AGENT_CHANGELOG.json
git commit -m "docs(product): roadmap V85 to V90"
git push -u origin agent/product/v85-roadmap-v85-v90
```

Ouvrir ensuite une Pull Request vers `main` avec le résumé ci-dessous.

## Résumé PR proposé

Cette PR ajoute le cadrage Produit V85 à V90 de NimbrayAI. Elle priorise la stabilisation V85 autour du chat, de l’upload, des états visibles, du mobile, de la personnalité IA et de la compatibilité Vercel, puis découpe les prochaines versions autour des sources projet, de l’orchestration agents, de la qualité conversationnelle, de l’onboarding public et de la consolidation plateforme.

## Prêt pour intégration ?

- [x] Oui
- [ ] Non

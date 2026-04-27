# Handoff Produit — V87 Beta Readiness

- Date : 2026-04-27
- Agent : Produit
- Branche : `agent/product/v87-beta-readiness`
- Destination PR : `main`
- Statut : prêt pour revue

## Mission

Définir les conditions produit nécessaires pour ouvrir NimbrayAI à une première bêta utilisable, prioriser les fonctionnalités restantes, écrire les critères d’acceptation et identifier les risques avant testeurs.

## Fichiers lus

- `CURRENT_SOURCE.json`
- `SOURCE_OF_TRUTH.md`
- `AGENTS.md`
- `AGENT_CHANGELOG.json`
- `COLLABORATIVE_WORKSPACES.md`
- `project-workspaces/02_agent-produit/ROADMAP.md`
- `project-workspaces/02_agent-produit/NOTES.md`

## Fichiers modifiés

- `project-workspaces/02_agent-produit/BETA_READINESS_V87.md`
- `project-workspaces/02_agent-produit/ROADMAP.md`
- `project-workspaces/02_agent-produit/NOTES.md`
- `project-workspaces/02_agent-produit/HANDOFF_PRODUIT_V87_beta-readiness.md`
- `AGENT_CHANGELOG.json`

## Résumé des changements

- Ajout d’un cadrage complet “première bêta utilisable”.
- Priorisation P0/P1/P2 des fonctionnalités restantes avant testeurs.
- Critères d’acceptation pour chat, upload, IA, mobile et déploiement.
- Roadmap courte V87 à V90 orientée bêta privée puis consolidation.
- Matrice des risques avant ouverture aux testeurs.
- Décision Go / No-Go pour éviter une bêta trop fragile.

## Décisions Produit

1. V87 doit être une bêta privée contrôlée, pas une ouverture publique large.
2. Les P0 sont : chat stable, upload bout-en-bout, erreurs claires, mobile utilisable, honnêteté IA, déploiement reproductible, feedback testeur.
3. Les ambitions mémoire cloud, RAG avancé, vision enrichie et actions autonomes restent P2 ou post-V90 tant que les parcours critiques ne sont pas solides.
4. La promesse utilisateur doit rester ambitieuse mais vérifiable : Nimbray travaille avec sources, documents, outils et contexte réellement disponibles.

## Risques principaux

- Upload partiellement fonctionnel uniquement côté interface.
- Promesse IA trop large par rapport aux capacités réelles branchées.
- Parcours mobile fragile au moment de la bêta.
- Erreurs API trop génériques pour aider les testeurs.
- Bêta ouverte sans boucle de feedback claire.

## Tests effectués

- `npm run source:check`
- `npm run agent:merge-check`

## Validation attendue avant merge

- Relecture Produit sur les priorités P0/P1/P2.
- Relecture Frontend/Backend/IA pour confirmer que les critères d’acceptation sont techniquement réalistes.
- Aucun changement runtime inclus dans cette PR Produit : risque CI faible.

## Préparation PR

Titre recommandé :

```text
docs(product): define V87 beta readiness
```

Corps recommandé :

```markdown
## Résumé
- Ajoute le cadrage Produit V87 pour une première bêta utilisable.
- Priorise les fonctionnalités restantes en P0/P1/P2.
- Définit les critères d’acceptation chat, upload, IA, mobile et déploiement.
- Ajoute une roadmap courte V87-V90 et une matrice de risques avant testeurs.

## Tests
- npm run source:check
- npm run agent:merge-check

## Risques
- Documentation uniquement : aucun changement runtime.
- Les critères doivent être confirmés par les agents Frontend, Backend et IA avant ouverture réelle aux testeurs.
```
